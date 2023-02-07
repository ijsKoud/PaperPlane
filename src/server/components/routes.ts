import type { NextFunction, Request, Response } from "express";
import type { Server } from "../Server";
import multer from "multer";
import { mkdir, readdir, rm, unlink, writeFile } from "node:fs/promises";
import { createToken, decryptToken, encryptPassword, encryptToken, formatBytes, generateId, getConfig, getProtocol, getUser } from "../utils";
import { join } from "node:path";
import { rateLimit } from "express-rate-limit";
import { boolean, object, string, ValidationError } from "yup";
import { Zip } from "zip-lib";

const config = getConfig();

export class Routes {
	public USER_AGENTS = [
		"discord",
		"Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)",
		"Mozilla/5.0 (Macintosh; Intel Mac OS X 11.6; rv:92.0) Gecko/20100101 Firefox/92.0",
		"Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:38.0) Gecko/20100101 Firefox/38.0"
	];

	public ratelimit = rateLimit({
		windowMs: 2e3,
		max: 25
	});

	public views: Record<string, number[]> = {};
	public visits: Record<string, number[]> = {};

	public multer = multer({
		limits: {
			files: config.maxFilesPerRequest,
			fileSize: config.maxFileSize
		},
		fileFilter: (req, file, cl) => {
			if (!config.extensions.length) return cl(null, true);

			const [, ..._extension] = file.originalname.split(/\./g);
			const extension = `.${_extension.join(".")}`;
			if (config.extensions.includes(extension)) return cl(null, false);

			cl(null, true);
		},
		storage: multer.diskStorage({
			destination: this.server.data.filesDir,
			filename: async (req, file, cl) => {
				const files = await readdir(this.server.data.filesDir);

				let id = generateId(true);
				while (files.includes(id)) id = generateId(true);

				const [, ..._extension] = file.originalname.split(/\./g);
				const extension = _extension.join(".");

				cl(null, `${id}.${extension}`);
			}
		})
	});

	public constructor(public server: Server) {}

	public init() {
		this.updateStats();

		this.server.express.get("/files/:id", this.ratelimit, this.getFile.bind(this)).get("/r/:id", this.ratelimit, this.getRedirect.bind(this));
		this.server.express.post("/api/upload", this.ratelimit, this.auth.bind(this), this.multer.array("upload"), this.upload.bind(this));
		this.server.express
			.delete("/api/dashboard/files/update", this.ratelimit, this.userAuth.bind(this), this.deleteFile.bind(this))
			.post("/api/dashboard/files/update", this.ratelimit, this.userAuth.bind(this), this.updateFile.bind(this));
		this.server.express
			.delete("/api/dashboard/urls/update", this.ratelimit, this.userAuth.bind(this), this.deleteUrl.bind(this))
			.post("/api/dashboard/urls/update", this.ratelimit, this.userAuth.bind(this), this.updateUrl.bind(this));
		this.server.express
			.patch("/api/user", this.ratelimit, this.userAuth.bind(this), this.updateUser.bind(this))
			.patch("/api/user/embed", this.ratelimit, this.userAuth.bind(this), this.userEmbed.bind(this))
			.post("/api/user/token", this.ratelimit, this.userAuth.bind(this), this.userToken.bind(this));

		this.server.express.post("/api/backup/create", this.ratelimit, this.userAuth.bind(this), this.backup.bind(this));
	}

	private async auth(req: Request, res: Response, next: NextFunction) {
		const authHeader = req.headers.authorization;
		if (!authHeader) {
			res.status(401).send({ message: "Unauthorized" });
			return;
		}

		try {
			const user = await this.server.prisma.user.findFirst({ where: { token: authHeader } });
			if (!user) {
				res.status(401).send({ message: "Unauthorized" });
				return;
			}
		} catch (err) {
			res.status(401).send({ message: "Unauthorized" });
			return;
		}

		next();
	}

	private async getUser(req: Request) {
		try {
			const { authorization } = req.headers;
			if (!authorization || !authorization.startsWith("Bearer ") || authorization.includes("null")) return null;

			const [username] = decryptToken(authorization.replace("Bearer ", "")).split(".");
			const user = await this.server.prisma.user.findFirst({ where: { username } });

			return user;
		} catch (err) {}

		return null;
	}

	private async userAuth(req: Request, res: Response, next: NextFunction) {
		const user = await this.getUser(req);
		if (!user) {
			res.status(401).send({ message: "You need to be logged in to view this content." });
			return;
		}

		next();
	}

	private async backup(req: Request, res: Response) {
		const backupDir = join(this.server.data.filesDir, "..", "backups");
		await mkdir(join(backupDir, "temp"), { recursive: true });
		await mkdir(join(backupDir, "archives"), { recursive: true });

		try {
			const { prisma } = this.server;
			const databaseData = {
				version: "3.0.0",
				user: await prisma.user.findFirst(),
				files:
					(await prisma.file.findMany()).map((file) => ({
						...file,
						size: formatBytes(Number(file.size)),
						password: file.password ? decryptToken(file.password) : null
					})) ?? [],
				urls: (await prisma.url.findMany()) ?? []
			};

			const id = `backup-${generateId(true)}`;
			const filePath = join(backupDir, "temp", `${id}-file.json`);
			await writeFile(filePath, JSON.stringify(databaseData));

			const zip = new Zip();
			zip.addFolder(this.server.data.filesDir, "files");
			zip.addFile(filePath, "db.json");

			await zip.archive(join(backupDir, "archives", `${id}.zip`));
			await rm(filePath, { maxRetries: 4, retryDelay: 1e3 });
			res.sendStatus(204);
		} catch (err) {
			this.server.logger.fatal("[BACKUP]: Fatal error while creating a backup ", err);
			res.sendStatus(500);
		}
	}

	private async getFile(req: Request, res: Response) {
		const { id } = req.params;
		const { force, test } = req.query;

		const isUserAgent = this.USER_AGENTS.includes(req.headers["user-agent"] ?? "");
		const user = await this.server.prisma.user.findFirst();

		const fileId = id.includes(".") ? id.split(".")[0] : id;
		const password = req.cookies[fileId];
		const authToken = req.cookies["PAPERPLANE_AUTH"];

		const file = await this.server.prisma.file.findUnique({ where: { id: fileId } });
		if (!file) return this.server.next.render404(req, res);
		if ((user?.embedEnabled && isUserAgent && !force) || test) return this.server.next.render(req, res, `/files/${id}`);

		const cookieUser = await getUser(authToken, this.server.prisma);
		if (!file.visible && !cookieUser) return this.server.next.render404(req, res);
		if (file.password && !cookieUser) {
			if (!password || typeof password !== "string") return this.server.next.render(req, res, `/files/${id}`);

			const [decrypted] = decryptToken(password).split(".");
			const [fileDecrypted] = decryptToken(file.password).split(".");
			if (decrypted !== fileDecrypted) return this.server.next.render(req, res, `/files/${id}`);
		}

		res.sendFile(file.path, (err) => {
			if (err) {
				res.end();
				this.server.logger.error(err);
				return;
			}

			if (!req.query.preview) {
				const views = this.views[file.id] ?? [];
				views.push(1);

				this.views[file.id] = views;
			}
		});
	}

	private async getRedirect(req: Request, res: Response) {
		const { id } = req.params;

		const url = await this.server.prisma.url.findUnique({ where: { id } });
		if (!url) return this.server.next.render404(req, res);

		const authToken = req.cookies["PAPERPLANE_AUTH"];
		const cookieUser = await getUser(authToken, this.server.prisma);
		if (!url.visible && !cookieUser) return this.server.next.render404(req, res);
		res.redirect(url.url);

		const visits = this.visits[url.id] ?? [];
		visits.push(1);

		this.visits[url.id] = visits;
	}

	private async upload(req: Request, res: Response) {
		const { short, path: linkPath } = (req.body ?? {}) as { short: string | undefined; path: string | undefined };
		if (short && typeof short === "string") {
			const links = await this.server.prisma.url.findMany();
			let path = linkPath;

			if (!path || links.find((link) => link.id === linkPath)) {
				path = generateId();
				while (links.find((link) => link.id === path)) path = generateId();
			}

			try {
				await this.server.prisma.url.create({ data: { date: new Date(), url: short, id: path } });
				res.send({ url: `${getProtocol()}${req.headers.host}/r/${path}` });

				this.server.websocket.events.emit("url_update");
				this.server.logger.info(`[CREATE]: New URL uploaded - URL: ${short} & URL Code: ${path}`);
			} catch (err) {
				res.status(500).send({ message: "An unknown error occurred while processing your request, please try again later." });
			}

			return;
		}

		try {
			const files = await Promise.all(
				((req.files ?? []) as Express.Multer.File[]).map(async (f) => {
					const id = generateId() || f.originalname.split(".")[0];
					const file = await this.server.prisma.file.create({
						data: { id, date: new Date(), path: join(this.server.data.filesDir, f.filename), size: BigInt(f.size) }
					});
					const fileExt = f.filename.split(".").slice(1).join(".");

					this.server.logger.info(`[FILES]: New file uploaded - File: ${f.filename}, Id: ${id} & size: ${formatBytes(f.size)}`);
					return `${getProtocol()}${req.headers.host}/files/${file.id}${config.nameType === "zerowidth" ? "" : `.${fileExt}`}`;
				})
			);

			this.server.websocket.events.emit("file_update");
			res.send({ files, url: files[0] });
		} catch (err) {
			res.status(500).send({ message: "An unknown error occurred while processing your request, please try again later." });
		}
	}

	private async deleteFile(req: Request, res: Response) {
		const { id } = req.body;
		if (!id) {
			res.status(400).send({ message: "No fileId provided." });
			return;
		}

		if (Array.isArray(id)) {
			const files = await this.server.prisma.file.findMany({ where: { id: { in: id } } });
			if (!files) {
				res.status(404).send({ message: "No files found on the server." });
				return;
			}

			try {
				await Promise.all(files.map((file) => unlink(file.path).catch(() => void 0)));
			} catch (err) {}

			res.sendStatus(204);
		} else if (typeof id === "string") {
			const file = await this.server.prisma.file.findFirst({ where: { id: id.split(".")[0] } });
			if (!file) {
				res.status(404).send({ message: "File was not found on the server." });
				return;
			}

			try {
				await unlink(file.path);
			} catch (err) {}

			res.sendStatus(204);
		}

		res.status(400).send({ message: "bad request" });
	}

	private async updateFile(req: Request, res: Response) {
		const schema = object({
			name: string().required("Name is a required field"),
			newName: string().required("newName is a required field"),
			password: string(),
			visible: boolean().required("visible is a required field")
		});
		let message = "";
		await schema.validate(req.body, { abortEarly: false }).catch((err: ValidationError) => {
			message = err.errors.join("; ");
		});
		if (message) {
			res.status(400).send({ message });
			return;
		}

		const { name, newName, password, visible } = req.body;
		const id = name.split(".")[0];

		const file = await this.server.prisma.file.findFirst({ where: { id } });
		if (!file) {
			res.status(404).send({ message: "No file found on the server." });
			return;
		}

		try {
			const pswd = password.length ? encryptToken(password) : null;
			const n = newName.split(".")[0] || id;
			await this.server.prisma.file.update({ where: { id }, data: { id: n, password: pswd, visible } });

			res.status(204).send(undefined);
		} catch (err) {
			this.server.logger.fatal("[FILES UPDATE]: ", err);
			res.status(500).send({ message: "Internal error, please try again later." });
		}

		this.server.websocket.events.emit("file_update");
	}

	private async deleteUrl(req: Request, res: Response) {
		const { id } = req.body;
		if (!id) {
			res.status(400).send({ message: "No urlId provided." });
			return;
		}

		if (Array.isArray(id)) {
			const urls = await this.server.prisma.url.findMany({ where: { id: { in: id } } });
			if (!urls) {
				res.status(404).send({ message: "No urls found on the server." });
				return;
			}

			try {
				await this.server.prisma.url.deleteMany({ where: { id: { in: urls.map((url) => url.id) } } });
			} catch (err) {}

			res.sendStatus(204);
		} else if (typeof id === "string") {
			const url = await this.server.prisma.url.findFirst({ where: { id: id.split(".")[0] } });
			if (!url) {
				res.status(404).send({ message: "URL was not found on the server." });
				return;
			}

			try {
				await this.server.prisma.url.delete({ where: { id: url.id } });
			} catch (err) {
				res.status(404).send({ message: "URL was not found on the server." });
				return;
			}

			res.sendStatus(204);
			this.server.websocket.events.emit("url_update");
		}
	}

	private async updateUrl(req: Request, res: Response) {
		const schema = object({
			name: string().required("Name is a required field"),
			newName: string().required("newName is a required field"),
			visible: boolean().required("visible is a required field")
		});
		let message = "";
		await schema.validate(req.body, { abortEarly: false }).catch((err: ValidationError) => {
			message = err.errors.join("; ");
		});
		if (message) {
			res.status(400).send({ message });
			return;
		}

		const { name, newName, visible } = req.body;
		const url = await this.server.prisma.url.findFirst({ where: { id: name } });
		if (!url) {
			res.status(404).send({ message: "No url found on the server." });
			return;
		}

		try {
			const id = newName || name;
			await this.server.prisma.url.update({ where: { id: name }, data: { id, visible } });

			res.sendStatus(204);
		} catch (err) {
			this.server.logger.fatal("[URL UPDATE]: ", err);
			res.status(500).send({ message: "Internal error, please try again later." });
		}

		this.server.websocket.events.emit("url_update");
	}

	private async updateUser(req: Request, res: Response) {
		const body = req.body as { password?: string; username?: string };
		if (typeof body.password !== "string" && typeof body.username !== "string") {
			res.status(400).json({ message: "Password/username/theme missing in request body" });
			return;
		}

		const user = await this.getUser(req);
		if (!user) {
			res.status(401).json({ message: "You need to be logged in to perform this action" });
			return;
		}

		if (body.password) {
			const password = encryptPassword(body.password);
			const token = encryptToken(`${user.username}.${Date.now()}`);

			user.password = password;
			await this.server.prisma.user.update({ where: { username: user.username }, data: user });

			res.json({ token });
		} else if (body.username) {
			const token = encryptToken(`${body.username}.${Date.now()}`);
			await this.server.prisma.user.update({ where: { username: user.username }, data: { username: body.username } });

			res.json({ token });
		}

		this.server.websocket.events.emit("user_update");
	}

	private async userEmbed(req: Request, res: Response) {
		const schema = object({
			embedColour: string()
				.required("embedColour is a required field")
				.test({ test: (v) => (v ? v.includes("#") : false), message: "embedColour must be a hex colour" }),
			embedTitle: string().max(256, "Embed title must not be longer than 256 characters"),
			embedDescription: string().max(4096, "Embed title must not be longer than 4096 characters"),
			embedEnabled: boolean().required("embedEnabled is a required field")
		});
		let message = "";
		await schema.validate(req.body, { abortEarly: false }).catch((err: ValidationError) => {
			message = err.errors.join("; ");
		});
		if (message) {
			res.status(400).send({ message });
			return;
		}

		const body = req.body as { embedColour: string; embedTitle: string; embedDescription: string; embedEnabled: boolean };
		let user = await this.getUser(req);
		if (!user) {
			res.status(401).json({ message: "You need to be logged in to perform this action" });
			return;
		}

		user = { ...user, ...body };
		await this.server.prisma.user.update({ where: { username: user.username }, data: user });
		res.sendStatus(204);

		this.server.websocket.events.emit("user_update");
	}

	private async userToken(req: Request, res: Response) {
		const user = await this.getUser(req);
		if (!user) {
			res.status(401).json({ message: "You need to be logged in to perform this action" });
			return;
		}

		user.token = createToken();
		await this.server.prisma.user.update({ where: { username: user.username }, data: user });
		res.sendStatus(204);

		this.server.websocket.events.emit("user_update");
	}

	private updateStats() {
		const updateViewsFn = async () => {
			for await (const file of Object.keys(this.views)) {
				const views = this.views[file].length;
				await this.server.prisma.file.update({ where: { id: file }, data: { views: { increment: views } } });

				delete this.views[file];
			}

			this.server.websocket.events.emit("file_update");
		};

		const updateVisitsFn = async () => {
			for await (const url of Object.keys(this.visits)) {
				const visits = this.visits[url].length;
				await this.server.prisma.url.update({ where: { id: url }, data: { visits: { increment: visits } } });

				delete this.visits[url];
			}

			this.server.websocket.events.emit("url_update");
		};

		setInterval(updateViewsFn.bind(this), 6e3);
		setInterval(updateVisitsFn.bind(this), 6e3);
	}
}

import type { NextFunction, Request, Response } from "express";
import { scryptSync, timingSafeEqual } from "node:crypto";
import type { Server } from "../Server";
import multer from "multer";
import { readdir } from "node:fs/promises";
import { decryptToken, generateId, getConfig } from "../utils";

const config = getConfig();

export class Routes {
	public DISCORD_IMAGE_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 11.6; rv:92.0) Gecko/20100101 Firefox/92.0";

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

				let id = generateId() || file.originalname.split(".")[0];
				while (files.includes(id)) id = generateId();

				const [, ..._extension] = file.originalname.split(/\./g);
				const extension = _extension.join(".");

				cl(null, `${id}.${extension}`);
			}
		})
	});

	public constructor(public server: Server) {}

	public init() {
		this.server.express.get("/files/:id", this.getFile.bind(this)).get("/r/:id", this.getRedirect.bind(this));
		this.server.express.post("/api/upload", this.auth.bind(this), this.multer.array("upload"), this.upload.bind(this));
	}

	private async auth(req: Request, res: Response, next: NextFunction) {
		const authHeader = req.headers.authorization;
		if (!authHeader) {
			res.status(401).send({ message: "Unauthorized" });
			return;
		}

		try {
			const decrypted = decryptToken(authHeader);
			const user = await this.server.prisma.user.findFirst({ where: { username: decrypted.split(".")[0] } });
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

	private async getFile(req: Request, res: Response) {
		const { id } = req.params;
		const { password, check } = req.query;
		const isUserAgent = req.headers["user-agent"] === this.DISCORD_IMAGE_AGENT;

		const user = await this.server.prisma.user.findFirst();

		const fileId = id.includes(".") ? id.split(".")[0] : id;
		const file = await this.server.prisma.file.findUnique({ where: { id: fileId } });

		if (!file) return this.server.next.render404(req, res);
		if (file.password && !password && !isUserAgent) return this.server.next.render(req, res, `/files/${id}?type=password`);
		if (user?.embedEnabled && isUserAgent)
			return this.server.next.render(
				req,
				res,
				`/files/${id}?type=discord&p=${encodeURIComponent(typeof password === "string" ? password : "")}`
			);

		if (file.password && (!password || typeof password !== "string")) return res.status(401).send({ message: "Unauthorized" });
		if (file.password) {
			const [salt, key] = file.password.split(":");
			const passwordBuffer = scryptSync(password as string, salt, 64);

			const keyBuffer = Buffer.from(key, "hex");
			const match = timingSafeEqual(passwordBuffer, keyBuffer);
			if (!match) return res.status(401).send({ message: "Incorrect password provided" });

			// check if a check param is present -> send 204 success res back
			if (check) return res.sendStatus(204);
		}

		res.sendFile(file.path, async (err) => {
			if (err) {
				res.end();
				this.server.logger.error(err);
				return;
			}

			await this.server.prisma.file.update({ where: { id: fileId }, data: { views: { increment: 1 } } });
		});
	}

	private async getRedirect(req: Request, res: Response) {
		const { id } = req.params;
		const url = await this.server.prisma.url.findUnique({ where: { id } });

		if (!url) return this.server.next.render404(req, res);
		res.redirect(url.url);

		await this.server.prisma.url.update({ where: { id }, data: { visits: { increment: 1 } } });
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

			await this.server.prisma.url.create({ data: { date: new Date(), url: short, id: path } });
			res.send({ url: `${req.protocol}://${req.headers.host}/r/${path}` });
			return;
		}

		const files = ((req.files ?? []) as Express.Multer.File[]).map((f) => {
			const name = config.nameType === "zerowidth" ? f.filename.split(".")[0] : f.filename;
			return `${req.protocol}://${req.headers.host}/files/${name}`;
		});
		res.send({ files, url: files[0] });
	}
}

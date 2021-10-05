import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { lstat, readdir, readFile, rename, unlink, writeFile } from "fs/promises";
import { lookup } from "mime-types";
import { join } from "path";
import getSettings from "../../settings";
import { Link } from "../types";
import { formatBytes, parseQuery } from "../utils";

const router = Router();
const client = new PrismaClient();
const settings = getSettings();
const ratelimit = rateLimit({
	windowMs: settings.ratelimit.time,
	max: settings.ratelimit.amount,
});

// links
router.get("/:id/r/:link", async (req, res) => {
	const { id, link } = req.params;

	const file = join(process.cwd(), "data", id, "links.json");
	const linksRaw = await readFile(file, "utf-8");
	const links: Link[] = JSON.parse(linksRaw);

	const linkData = links.find((l) => l.path === link);
	if (!linkData)
		return res.status(404).send({
			message: "The requested redirection url was not found",
			error: "Redirection URL was not found on the server",
		});

	res.send(linkData.url);
});

router.delete("/:id/r/:link", ratelimit, async (req, res) => {
	const { id, link } = req.params;
	const { session } = req.cookies;
	if (!session)
		return res.status(401).send({
			message: "You must be logged in to perform this action",
			error: "User unauthorized",
		});

	const user = await client.session.findFirst({
		where: { token: session },
		include: { user: true },
	});
	if (!user)
		return res.status(401).send({
			message: "You must be logged in to perform this action",
			error: "User unauthorized",
		});

	try {
		const file = join(process.cwd(), "data", id, "links.json");
		const linksRaw = await readFile(file, "utf-8");
		const links: Link[] = JSON.parse(linksRaw);

		const newLinks = links.filter((l) => l.path !== link);
		await writeFile(file, JSON.stringify(newLinks));
		res.sendStatus(204);
	} catch (err) {
		console.error(err);
		res.status(500).send({
			message: "Something went wrong on our side, please try again later.",
			error: "Internal error, check logs for more information",
		});
	}
});

// files
router.get("/:id/:file", async (req, res) => {
	const { id, file } = req.params;
	const filePath = join(process.cwd(), "data", id, "files", file);
	const data = parseQuery(req.query.data ?? "false");

	if (data === "true")
		try {
			const fileData = await lstat(filePath);

			return res.send({
				name: file,
				size: formatBytes(fileData.size),
				_size: fileData.size,
				date: fileData.birthtimeMs,
				type: lookup(file) || "unknown",
				raw: await readFile(filePath, "utf-8"),
			});
		} catch (err) {
			if (err.code === "ENOENT")
				return res.status(404).send({
					message: "The requested file does not exist",
					error: "No such file or directory",
				});
			return res.status(500).send({
				message: "Something went wrong on our side, please try again later.",
				error: "Internal error, check logs for more information",
			});
		}

	res.sendFile(filePath, () => res.end());
});

router.delete("/:id/:file", ratelimit, async (req, res) => {
	const { id, file } = req.params;
	const { session } = req.cookies;
	if (!session)
		return res.status(401).send({
			message: "You must be logged in to perform this action",
			error: "User unauthorized",
		});

	const user = await client.session.findFirst({
		where: { token: session },
		include: { user: true },
	});
	if (!user)
		return res.status(401).send({
			message: "You must be logged in to perform this action",
			error: "User unauthorized",
		});

	try {
		await unlink(join(process.cwd(), "data", id, "files", file));
		res.sendStatus(204);
	} catch (err) {
		if (err.code === "ENOENT")
			return res
				.status(404)
				.send({ message: "The requested file does not exist", error: "No such file or directory" });
		res.status(500).send({
			message: "Something went wrong on our side, please try again later.",
			error: "Internal error, check logs for more information",
		});
	}
});

router.patch("/:id/:file", ratelimit, async (req, res) => {
	const { id, file } = req.params;
	let { name } = req.body;
	if (!name)
		return res.status(400).send({
			message: "Something went wrong while processing your request, please try again later",
			error: "Missing 'name' in request body",
		});

	const { session } = req.cookies;
	if (!session)
		return res.status(401).send({
			message: "You must be logged in to perform this action",
			error: "User unauthorized",
		});

	const user = await client.session.findFirst({
		where: { token: session },
		include: { user: true },
	});
	if (!user)
		return res.status(401).send({
			message: "You must be logged in to perform this action",
			error: "User unauthorized",
		});

	const base = join(process.cwd(), "data", id, "files");
	const files = await readdir(base);
	if (!files.includes(file))
		return res.status(404).send({
			message: "The requested file was not found on the server",
			error: "No file found on the server",
		});

	const fileExt = file.split(".").pop();
	if (!lookup(name)) name = `${name}.${fileExt}`;

	await rename(join(base, file), join(base, name));
	res.sendStatus(204);
});

router.patch("/:id/r/:path", ratelimit, async (req, res) => {
	const { id, path } = req.params;
	const { path: newPath, url } = req.body;
	if (!newPath || !url)
		return res.status(400).send({
			message: "Something went wrong while processing your request, please try again later",
			error: "Missing 'path' or 'url' in request body",
		});

	const { session } = req.cookies;
	if (!session)
		return res.status(401).send({
			message: "You must be logged in to perform this action",
			error: "User unauthorized",
		});

	const user = await client.session.findFirst({
		where: { token: session },
		include: { user: true },
	});
	if (!user)
		return res.status(401).send({
			message: "You must be logged in to perform this action",
			error: "User unauthorized",
		});

	const base = join(process.cwd(), "data", id, "links.json");
	const linksRaw = await readFile(base, "utf-8");
	const links = (JSON.parse(linksRaw) as Link[]).map((l, i) => ({ link: l, index: i }));

	const link = links.find((l) => l.link.path === path);
	if (!link)
		return res.status(404).send({
			message: "The requested link was not found on the server",
			error: "No link found on the server",
		});

	link.link.path = newPath;
	link.link.url = url;

	const newLinks = links.map((v) => (v.index === link.index ? link.link : v.link));
	await writeFile(base, JSON.stringify(newLinks));

	res.sendStatus(204);
});

export default router;

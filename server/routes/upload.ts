import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import { join } from "path";
import { readdir, readFile, rename, unlink, writeFile } from "fs/promises";
import { nanoid } from "nanoid";
import { Link } from "../types";
import getSettings from "../../settings";

const client = new PrismaClient();
const router = Router();

const uploader = multer({
	storage: multer.diskStorage({ destination: join(process.cwd(), "data", "temp") }),
});

router.post("/upload", uploader.array("upload"), async (req, res) => {
	req.files = req.files as Express.Multer.File[];
	if (
		(!req.files || req.files.length === 0) &&
		(typeof req.body.short !== "string" || req.body.short.length <= 0)
	)
		return res.status(400).send({
			message: "No files/links were uploaded",
			error: "Expected array with files or short in body but received empty array and empty body",
		});

	const token = req.headers.authorization;
	if (!token) {
		await deleteFiles(req.files ?? []);
		return res.status(401).send({
			message: "You must be logged in to do perform this action",
			error: "No Authorization key provided",
		});
	}

	const user = await client.user.findFirst({ where: { token } });
	if (!user) {
		await deleteFiles(req.files ?? []);
		return res.status(401).send({
			message: "You must be logged in to do perform this action",
			error: "Invalid Authorization key provided",
		});
	}

	const settings = getSettings();
	const short = req.body.short;
	const linkPath = req.body.path;
	if (typeof short === "string" && short.length > 0) {
		const path = join(process.cwd(), "data", user.userId, "links.json");
		const linksRaw = await readFile(path, "utf-8");
		const links: Link[] = JSON.parse(linksRaw);

		let id = linkPath || nanoid(8);
		while (links.some((l) => l.path === id)) id = nanoid(8);

		await writeFile(path, JSON.stringify([...links, { date: Date.now(), path: id, url: short }]));
		await deleteFiles(req.files);

		return res.send({ url: `${settings.dashboard}/${user.userId}/r/${id}` });
	}

	const files: string[] = [];
	const dir = join(process.cwd(), "data", user.userId, "files");

	for (const file of req.files) {
		if (file.size > settings.uploadLimit)
			return res.status(400).send({
				message: "An uploaded file is too big",
				error: `Files[${req.files.indexOf(file)}] is too big`,
			});

		const fileNames = await readdir(dir);
		if (fileNames.includes(file.originalname)) {
			deleteFiles(req.files);
			return res.status(400).send({
				message: "File with that name already exists",
				error: `Files[${req.files.indexOf(
					file
				)}] has a name that already exists in the files folder`,
			});
		}

		await rename(file.path, join(dir, file.originalname)).catch((e) => console.error(e));
		files.push(`${settings.dashboard}/${user.userId}/${file.originalname}`);
	}

	res.send({ files, url: files[0] });
});

const deleteFiles = async (files: Express.Multer.File[]) => {
	if (!Array.isArray(files)) return;
	for (const file of files) await unlink(file.path).catch(() => void 0);
};

export default router;

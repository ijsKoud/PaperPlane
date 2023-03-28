import type { Response } from "express";
import { rm, stat, rename } from "node:fs/promises";
import { join } from "node:path";
import { Auth } from "../lib/Auth.js";
import { chunkUpload } from "../lib/index.js";
import type { DashboardRequest, Middleware, RequestMethods } from "../lib/types.js";
import type Server from "../Server.js";
import { extension } from "mime-types";

const getSize = (size: number): number | undefined => {
	if (size < 0) return 0;
	return size === 0 ? undefined : size;
};

export default async function handler(server: Server, req: DashboardRequest, res: Response) {
	if (!req.locals.domain) {
		res.status(500).send({ message: "Internal server error, please try again later." });
		return;
	}

	const maxSize = getSize(req.locals.domain.maxStorage === 0 ? 0 : req.locals.domain.maxStorage - req.locals.domain.storage);

	try {
		const assembleChunks = await chunkUpload(
			req,
			join(req.locals.domain.filesPath, "..", "tmp"),
			maxSize ?? Infinity,
			req.locals.domain.server.config.parseStorage("10 MB")
		);
		if (!assembleChunks) {
			res.sendStatus(204);
			return;
		}

		const file = await assembleChunks();
		if (!file.postParams.type || typeof file.postParams.type !== "string") {
			res.status(400).send("Missing file type in postParams");
			await rm(file.filePath).catch(() => void 0);
			return;
		}

		const stats = await stat(file.filePath);
		const ext = extension(file.postParams.type);
		if (!ext) {
			res.status(400).send("Missing file type in postParams");
			await rm(file.filePath).catch(() => void 0);
			return;
		}

		switch (req.locals.domain.extensionsMode) {
			case "block":
				if (req.locals.domain.extensions.includes(ext)) {
					res.status(400).send("File extension is not allowed");
					await rm(file.filePath).catch(() => void 0);
					return;
				}
				break;
			case "pass":
				if (!req.locals.domain.extensions.includes(ext)) {
					res.status(400).send("File extension is not allowed");
					await rm(file.filePath).catch(() => void 0);
					return;
				}
				break;
		}

		const name = `${Auth.generateToken(32)}.${ext}`;
		await rename(file.filePath, join(req.locals.domain.filesPath, name));
		const fileData = await req.locals.domain.addFile({
			destination: file.filePath,
			filename: name,
			fieldname: "upload",
			buffer: null as any,
			originalname: name,
			size: stats.size,
			mimetype: file.postParams.type,
			stream: null as any,
			path: "",
			encoding: ""
		});
		const fileUrl = `${req.protocol}://${req.locals.domain}/files/${fileData}`;

		res.send({ files: [fileUrl], url: fileUrl });
	} catch (err) {
		console.log(err);
		res.sendStatus(500);
	}
}

export const methods: RequestMethods[] = ["post"];
export const middleware: Middleware[] = [Auth.userApiKeyMiddleware.bind(Auth)];
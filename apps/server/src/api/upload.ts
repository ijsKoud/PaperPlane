import type { NextFunction, Response } from "express";
import { extension } from "mime-types";
import multer, { diskStorage } from "multer";
import { Auth } from "../lib/Auth.js";
import type { DashboardRequest, Middleware, RequestMethods } from "../lib/types.js";
import { Utils } from "../lib/utils.js";
import type Server from "../Server.js";

export default async function handler(server: Server, req: DashboardRequest, res: Response) {
	if (!req.locals.domain) {
		res.status(500).send({ message: "Internal server error, please try again later." });
		return;
	}

	if (req.files?.length) {
		try {
			const filesArray = (req.files ?? []) as Express.Multer.File[];
			const _files = await Promise.all(filesArray.map((file) => req.locals.domain.addFile(file)));
			const files = _files.map((filename) => `${Utils.getProtocol()}${req.locals.domain}/files/${filename}`);

			res.send({ files, url: files[0] });
		} catch (err) {
			server.logger.fatal(`[UPLOAD:POST]: Fatal error while uploading a file`, err);
			res.status(500).send({ message: "Internal server error occured, please try again later." });
		}

		return;
	}

	const data = req.body as { short?: string; path?: string } | undefined;
	if (!data) {
		res.status(400).send({ message: "No files or shorturl data provided" });
		return;
	}

	if (typeof data.short !== "string") {
		res.status(400).send({ message: "No shorturl data provided" });
		return;
	}

	const links = await server.prisma.url.findMany({ where: { domain: req.locals.domain.domain } });
	let path = typeof data.path === "string" ? data.path : "";
	const strategy = req.locals.domain.nameStrategy === "name" ? "id" : req.locals.domain.nameStrategy;

	if (!path.length || links.find((link) => link.id === path)) {
		path = Utils.generateId(strategy, req.locals.domain.nameLength) as string;
		while (links.find((link) => link.id === path)) path = Utils.generateId(strategy, req.locals.domain.nameLength) as string;
	}

	try {
		await server.prisma.url.create({ data: { date: new Date(), url: data.short, id: path, domain: req.locals.domain.domain } });
		res.send({ url: `${Utils.getProtocol()}${req.locals.domain.domain}/r/${path}` });
	} catch (err) {
		server.logger.fatal(`[UPLOAD:POST]: Fatal error while uploading a shorturl`, err);
		res.status(500).send({ message: "Internal server error occured, please try again later." });
	}
}

const fileFilter: multer.Options["fileFilter"] = (req: DashboardRequest, file, cb) => {
	const { extensions, extensionsMode, disabled } = req.locals.domain;
	if (disabled) return cb(null, false);

	const ext = file.originalname.split(".").filter(Boolean).slice(1).join(".");
	switch (extensionsMode) {
		case "block":
			if (extensions.includes(ext)) return cb(null, false);
			break;
		case "pass":
			if (!extensions.includes(ext)) return cb(null, false);
			break;
	}

	cb(null, true);
};

const getSize = (size: number): number | undefined => {
	if (size < 0) return 0;
	return size === 0 ? undefined : size;
};

const multerMiddleware = (server: Server, req: any, res: Response, next: NextFunction) => {
	const getExtension = (file: Express.Multer.File) => extension(file.mimetype) || file.originalname.split(".").filter(Boolean).slice(1).join(".");
	const limits: multer.Options["limits"] = {
		fileSize: getSize(req.locals.domain.uploadSize),
		fieldSize: getSize(req.locals.domain.maxStorage === 0 ? 0 : req.locals.domain.maxStorage - req.locals.domain.storage)
	};
	const storage = diskStorage({
		destination: (req, file, cb) => cb(null, (req as DashboardRequest).locals.domain.filesPath),
		filename: (req, file, cb) => cb(null, `${Auth.generateToken(32)}.${getExtension(file)}`)
	});

	const multerHandler = multer({
		storage,
		fileFilter,
		limits
	}).array("upload");

	try {
		multerHandler(req, res, next);
	} catch (err) {
		server.logger.error("[MULTER]: ", err);
		res.status(500).send({ message: err.message ?? "Internal server error, please try again later." });
	}
};
export const methods: RequestMethods[] = ["post"];
export const middleware: Middleware[] = [Auth.userApiKeyMiddleware.bind(Auth), multerMiddleware];

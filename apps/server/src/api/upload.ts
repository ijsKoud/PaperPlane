import type { NextFunction, Response } from "express";
import multer, { diskStorage } from "multer";
import { Auth } from "../lib/Auth.js";
import type { DashboardRequest, Middleware, RequestMethods } from "../lib/types.js";
import type Server from "../Server.js";

export default async function handler(server: Server, req: DashboardRequest, res: Response) {
	if (!req.locals.domain) {
		res.status(500).send({ message: "Internal server error, please try again later." });
		return;
	}

	if (req.files) {
		try {
			const filesArray = (req.files ?? []) as Express.Multer.File[];
			const _files = await Promise.all(filesArray.map((file) => req.locals.domain.addFile(file)));
			const files = _files.map((file) => `${req.protocol}://${req.locals.domain}/files/${file}`);

			res.send({ files, url: files[0] });
		} catch (err) {
			server.logger.fatal(`[UPLOAD:POST]: Fatal error while uploading a file`, err);
			res.status(500).send({ message: "Internal server error occured, please try again later." });
		}
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
	const limits: multer.Options["limits"] = {
		fileSize: getSize(req.locals.domain.uploadSize),
		fieldSize: getSize(req.locals.domain.maxStorage === 0 ? 0 : req.locals.domain.maxStorage - req.locals.domain.storage)
	};
	const storage = diskStorage({
		destination: (req, file, cb) => cb(null, (req as DashboardRequest).locals.domain.filesPath),
		filename: (req, file, cb) => cb(null, `${Auth.generateToken(32)}.${file.originalname.split(".").filter(Boolean).slice(1).join(".")}`)
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

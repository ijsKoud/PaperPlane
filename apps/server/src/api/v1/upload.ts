import type { Response } from "express";
import { Auth, Domain, type DashboardRequest, type Middleware, type RequestMethods, Utils } from "../../lib/index.js";
import formidable from "formidable";
import type Server from "../../Server.js";

export default async function handler(server: Server, req: DashboardRequest, res: Response) {
	if (!req.locals.domain) {
		res.status(500).send({ message: "Internal server error, please try again later." });
		return;
	}

	const form = formidable({
		filter: (part) => fileFilter(part, req.locals.domain),
		filename: (name, ext) => `${Auth.generateToken(32)}${ext}`,
		uploadDir: req.locals.domain.filesPath,
		keepExtensions: true,
		maxFileSize: getSize(req.locals.domain.uploadSize),
		maxFieldsSize: getSize(req.locals.domain.maxStorage === 0 ? 0 : req.locals.domain.maxStorage - req.locals.domain.storage)
	});

	try {
		const [fields, files] = await form.parse(req);
		const uploadedFiles = files.file;
		if (!uploadedFiles) {
			res.status(400).send({ errors: [{ field: "upload", code: "MISSING_UPLOAD_FILES", message: "Missing uploaded files." }] });
			return;
		}

		const name = fields.name?.[0];
		const password = fields.password?.[0];
		const visible = fields.visible?.[0];
		if (uploadedFiles.length === 1) {
			const file = await req.locals.domain.registerUpload(uploadedFiles[0], { name, password, visible: visible === "false" ? false : true });
			const fileUrl = `${Utils.getProtocol()}${req.locals.domain}/files/${file}`;
			res.send({ url: fileUrl, files: { [uploadedFiles[0].originalFilename!]: fileUrl } });
			return;
		}

		const registedFiles = await Promise.all(
			uploadedFiles.map(async (file) => ({ url: await req.locals.domain.registerUpload(file), name: file.originalFilename! }))
		);
		res.send({
			url: registedFiles[0],
			files: registedFiles
				.map((file) => ({ [file.name]: `${Utils.getProtocol()}${req.locals.domain}/files/${file.url}` }))
				.reduce((a, b) => ({ ...a, ...b }), {})
		});
	} catch (err) {
		server.logger.fatal(`[UPLOAD:POST]: Fatal error while uploading a file`, err);
		res.status(500).send({
			errors: [{ field: undefined, code: "INTERNAL_ERROR", message: "Internal server error occured, please try again later." }]
		});
	}
}

/**
 * Filters out disallowed files
 * @param part The formidable content part
 * @param domain The domain the upload is coming from
 * @returns
 */
const fileFilter = (part: formidable.Part, domain: Domain) => {
	const { extensions, extensionsMode, disabled } = domain;
	if (disabled || !part.originalFilename || !part.mimetype) return false;

	const ext = part.originalFilename.split(".").filter(Boolean).slice(1).join(".");
	switch (extensionsMode) {
		case "block":
			if (extensions.includes(ext)) return false;
			break;
		case "pass":
			if (!extensions.includes(ext)) return false;
			break;
	}

	return true;
};

const getSize = (size: number): number | undefined => {
	if (size < 0) return 0;
	return size === 0 ? undefined : size;
};

export const methods: RequestMethods[] = ["post"];
export const middleware: Middleware[] = [Auth.userApiKeyMiddleware.bind(Auth)];

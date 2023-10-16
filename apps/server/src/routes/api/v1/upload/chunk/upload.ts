import type Domain from "#components/Domain.js";
import { Auth } from "#lib/Auth.js";
import type Server from "#server.js";
import { ApplyOptions, Route, methods } from "@snowcrystals/highway";
import type { NextFunction, Request, Response } from "express";
import formidable from "formidable";

@ApplyOptions<Route.Options>({ ratelimit: { max: 25, windowMs: 1e3 / 2 }, middleware: [[methods.POST, "user-api-key"]] })
export default class ApiRoute extends Route<Server> {
	public async [methods.POST](req: Request, res: Response, next: NextFunction, context: Record<"domain", Domain>) {
		const { domain } = context;
		const getSize = (size: number): number | undefined => {
			if (size < 0) return 0;
			return size === 0 ? undefined : size;
		};

		const form = formidable({
			multiples: false,
			keepExtensions: true,
			uploadDir: domain.filesPath,
			maxFileSize: getSize(domain.uploadSize),
			maxFieldsSize: getSize(domain.maxStorage === 0 ? 0 : domain.maxStorage - domain.storage),
			filename: (name, ext) => `${Auth.generateToken(32)}${ext}`
		});

		try {
			const [fields, files] = await form.parse(req);
			const uploadedFiles = files.file;
			if (!uploadedFiles) {
				res.status(400).send({ errors: [{ field: "upload", code: "MISSING_UPLOAD_FILES", message: "Missing uploaded files." }] });
				return;
			}

			const partialFileId = fields["partial-file-id"]?.[0];
			if (!partialFileId) {
				res.status(400).send({ errors: [{ field: "partial-file-id", code: "MISSING_FIELD", message: "Missing partial file id." }] });
				return;
			}

			const partialFileHandler = domain.partialFileManager.partials.get(partialFileId);
			if (!partialFileHandler) {
				res.status(400).send({ errors: [{ field: "partial-file-id", code: "INVALID_FIELD", message: "Invalid partial file id." }] });
				return;
			}

			await partialFileHandler.registerUpload(uploadedFiles[0]);
			res.sendStatus(204);
		} catch (err) {
			this.server.logger.fatal(`[CHUNK_UPLOADING:UPLOAD]: Fatal error while uploading a partial file chunk`, err);
			res.status(500).send({
				errors: [{ field: null, code: "INTERNAL_ERROR", message: "Internal server error occured, please try again later." }]
			});
		}
	}
}

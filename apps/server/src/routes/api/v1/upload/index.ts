import type Domain from "#components/Domain.js";
import { Auth } from "#lib/Auth.js";
import type Server from "#server.js";
import { ApplyOptions, Route, methods } from "@snowcrystals/highway";
import type { NextFunction, Request, Response } from "express";
import formidable from "formidable";

@ApplyOptions<Route.Options>({ ratelimit: { max: 2, windowMs: 1e3 }, middleware: [[methods.POST, "user-api-key"]] })
export default class ApiRoute extends Route<Server> {
	public async [methods.POST](req: Request, res: Response, next: NextFunction, context: Record<"domain", Domain>) {
		const { domain } = context;
		const getSize = (size: number): number | undefined => {
			if (size < 0) return 0;
			return size === 0 ? undefined : size;
		};

		const form = formidable({
			multiples: true,
			keepExtensions: true,
			uploadDir: domain.filesPath,
			maxFileSize: getSize(domain.uploadSize),
			maxFieldsSize: getSize(domain.maxStorage === 0 ? 0 : domain.maxStorage - domain.storage),
			filter: (part) => this.fileFilter(part, domain),
			filename: (name, ext) => `${Auth.generateToken(32)}${ext}`
		});

		try {
			const [fields, files] = await form.parse(req);
			const uploadedFiles = files.file;
			if (!uploadedFiles) {
				res.status(400).send({ errors: [{ field: "upload", code: "MISSING_UPLOAD_FILES", message: "Missing uploaded files." }] });
				return;
			}

			const uploadConfig = this.parseFields(fields);
			if (uploadedFiles.length === 1) {
				const file = await domain.registerFile(uploadedFiles[0], uploadConfig);
				const fileUrl = `${req.protocol}://${domain}/files/${file}`;
				res.send({ url: fileUrl, files: { [uploadedFiles[0].originalFilename!]: fileUrl } });
				return;
			}

			const registedFiles = await Promise.all(
				uploadedFiles.map(async (file) => ({
					url: await domain.registerFile(file, { visible: uploadConfig.visible }),
					name: file.originalFilename!
				}))
			);
			res.send({
				url: registedFiles[0].url,
				files: registedFiles
					.map((file) => ({ [file.name]: `${req.protocol}://${domain}/files/${file.url}` }))
					.reduce((a, b) => ({ ...a, ...b }), {})
			});
		} catch (err) {
			this.server.logger.fatal(`[UPLOAD:POST]: Fatal error while uploading a file`, err);
			res.status(500).send({
				errors: [{ field: undefined, code: "INTERNAL_ERROR", message: "Internal server error occured, please try again later." }]
			});
		}
	}

	/**
	 * Parses the incoming formidable fields
	 * @param fields The fields to parse
	 * @returns
	 */
	private parseFields(fields: formidable.Fields<string>) {
		const name = fields.name?.[0]; // custom name for the file
		const password = fields.password?.[0]; // password for the file
		const visible = fields.visible?.[0]; // visiblity status

		return {
			name,
			password,
			visible: visible === "false" ? false : true
		};
	}

	/**
	 * Filters out disallowed files
	 * @param part The formidable content part
	 * @param domain The domain the upload is coming from
	 * @returns
	 */
	private fileFilter(part: formidable.Part, domain: Domain) {
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
	}
}

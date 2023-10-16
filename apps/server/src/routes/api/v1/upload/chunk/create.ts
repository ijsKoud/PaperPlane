import type Domain from "#components/Domain.js";
import { Utils } from "#lib/utils.js";
import type Server from "#server.js";
import { ApplyOptions, Route, methods } from "@snowcrystals/highway";
import type { NextFunction, Request, Response } from "express";
import { ZodError, z } from "zod";
import { types } from "mime-types";

@ApplyOptions<Route.Options>({ ratelimit: { max: 1, windowMs: 1e3 }, middleware: [[methods.POST, "user-api-key"]] })
export default class ApiRoute extends Route<Server> {
	public async [methods.POST](req: Request, res: Response, next: NextFunction, { domain }: Record<"domain", Domain>) {
		const body = this.parseBody(req.body);
		if (body instanceof ZodError) {
			const errors = Utils.parseZodError(body);
			res.status(400).send({ errors });
			return;
		}

		switch (domain.extensionsMode) {
			case "block":
				if (domain.extensions.includes(Utils.getExtension(body.mimeType)!)) {
					res.status(403).send({
						errors: [
							{
								field: "mimeType",
								code: "DISALLOWED_EXTENSION",
								message: "The provided mime-type and its file-extension are not allowed."
							}
						]
					});

					return;
				}
				break;
			case "pass":
				if (!domain.extensions.includes(Utils.getExtension(body.mimeType)!)) {
					res.status(403).send({
						errors: [
							{
								field: "mimeType",
								code: "DISALLOWED_EXTENSION",
								message: "The provided mime-type and its file-extension are not allowed."
							}
						]
					});

					return;
				}
				break;
		}

		const existingFile = await this.server.prisma.partialFile.findFirst({ where: { filename: body.filename, domain: domain.domain } });
		if (existingFile) {
			res.status(409).send({
				errors: [{ field: "filename", code: "DUPLICATE_FIELD", message: "A file with the provided filename already exists" }]
			});
			return;
		}

		try {
			const partialFile = await domain.partialFileManager.create(body);
			res.status(200).send({ id: partialFile.id });
		} catch (err) {
			this.server.logger.fatal("[CHUNK_UPLOADING:CREATE]: Fatal error while creating a partial file handler", err);
			res.status(500).send({
				errors: [
					{
						field: null,
						code: "INTERNAL_SERVER_ERROR",
						message: "Unknown error occurred, please try again later."
					}
				]
			});
		}
	}

	/**
	 * Parses the request body
	 * @param body The body to parse
	 * @returns Parsed json content or ZodError if there was a parsing issue
	 */
	private parseBody(body: any) {
		const schema = z.object({
			filename: z.string({ invalid_type_error: "Property 'filename' must be a string" }).optional(),
			mimeType: z
				.string({ required_error: "A valid mimetype is required", invalid_type_error: "Property 'mimeType' must be a string" })
				.refine((arg) => Object.values(types).includes(arg), "The provided mimeType is not one of mimeType[]"),
			visible: z.boolean({ required_error: "Visibility state is required", invalid_type_error: "Property 'visible' must be a boolean" }),
			password: z.string({ invalid_type_error: "Property 'password' must be a string" }).optional()
		});

		try {
			return schema.parse(body);
		} catch (error) {
			return error as ZodError;
		}
	}
}

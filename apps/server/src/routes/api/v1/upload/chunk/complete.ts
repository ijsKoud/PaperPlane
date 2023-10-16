import type Domain from "#components/Domain.js";
import { Utils } from "#lib/utils.js";
import type Server from "#server.js";
import { ApplyOptions, Route, methods } from "@snowcrystals/highway";
import type { NextFunction, Request, Response } from "express";
import { ZodError, z } from "zod";

@ApplyOptions<Route.Options>({ ratelimit: { max: 25, windowMs: 1e3 }, middleware: [[methods.POST, "user-api-key"]] })
export default class ApiRoute extends Route<Server> {
	public async [methods.POST](req: Request, res: Response, next: NextFunction, { domain }: Record<"domain", Domain>) {
		const body = this.parseBody(req.body);
		if (body instanceof ZodError) {
			const errors = Utils.parseZodError(body);
			res.status(400).send({ errors });
			return;
		}

		const partialFileHandler = domain.partialFileManager.partials.get(body.id);
		if (!partialFileHandler) {
			res.status(409).send({
				errors: [{ field: "id", code: "NOT_FOUND", message: "A partialfile handler with the provided id does not exist" }]
			});
			return;
		}

		if (partialFileHandler.status === "OPEN") {
			partialFileHandler.complete();
			res.status(200).send({ status: "PROCESSING", url: null });
			return;
		} else if (partialFileHandler.status === "PROCESSING") {
			res.status(200).send({ status: "PROCESSING", url: null });
			return;
		}

		clearTimeout(partialFileHandler.timeout);
		domain.partialFileManager.partials.delete(body.id);
		await this.server.prisma.partialFile.delete({ where: { path: partialFileHandler.path } });

		res.status(200).send({ status: "FINISHED", url: `${Utils.getProtocol()}${domain.domain}/files/${partialFileHandler.documentId}` });
	}

	/**
	 * Parses the request body
	 * @param body The body to parse
	 * @returns Parsed json content or ZodError if there was a parsing issue
	 */
	private parseBody(body: any) {
		const schema = z.object({
			id: z.string({ invalid_type_error: "Property 'filename' must be a string", required_error: "Partialfile handler id is required" })
		});

		try {
			return schema.parse(body);
		} catch (error) {
			return error as ZodError;
		}
	}
}

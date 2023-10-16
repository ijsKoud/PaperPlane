import type Domain from "#components/Domain.js";
import { Utils } from "#lib/utils.js";
import type Server from "#server.js";
import { ApplyOptions, Route, methods } from "@snowcrystals/highway";
import type { NextFunction, Request, Response } from "express";
import { ZodError, z } from "zod";

@ApplyOptions<Route.Options>({ ratelimit: { max: 5, windowMs: 1e3 }, middleware: [[methods.DELETE, "user-api-key"]] })
export default class ApiRoute extends Route<Server> {
	public async [methods.DELETE](req: Request, res: Response, next: NextFunction, { domain }: Record<"domain", Domain>) {
		const body = this.parseBody(req.body);
		if (body instanceof ZodError) {
			const errors = Utils.parseZodError(body);
			res.status(400).send({ errors });
			return;
		}

		try {
			const url = await this.server.prisma.url.findFirst({ where: { id: body.name, domain: domain.domain } });
			if (!url) {
				res.status(404).send({
					errors: [{ field: "name", code: "URL_NOT_FOUND", message: "A shorturl with the provided name does not exist" }]
				});
				return;
			}

			await this.server.prisma.url.delete({ where: { id_domain: { domain: domain.domain, id: body.name } } });
			res.sendStatus(204);
		} catch (err) {
			this.server.logger.fatal("[URL:DELETE]: Fatal error while deleting a shorturl", err);
			res.status(500).send({
				errors: [
					{
						field: null,
						code: "INTERNAL_SERVER_ERROR",
						message: "Unknown error occurred while deleting a shorturl, please try again later."
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
			name: z.string({ invalid_type_error: "Property 'name' must be a string", required_error: "The shorturl name is required" })
		});

		try {
			return schema.parse(body);
		} catch (error) {
			return error as ZodError;
		}
	}
}

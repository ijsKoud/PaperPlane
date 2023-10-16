import type Domain from "#components/Domain.js";
import { Utils } from "#lib/utils.js";
import type Server from "#server.js";
import { ApplyOptions, Route, methods } from "@snowcrystals/highway";
import type { NextFunction, Request, Response } from "express";
import { ZodError, z } from "zod";

@ApplyOptions<Route.Options>({ ratelimit: { max: 5, windowMs: 1e3 }, middleware: [[methods.POST, "user-api-key"]] })
export default class ApiRoute extends Route<Server> {
	public async [methods.POST](req: Request, res: Response, next: NextFunction, { domain }: Record<"domain", Domain>) {
		const body = this.parseBody(req.body);
		if (body instanceof ZodError) {
			const errors = Utils.parseZodError(body);
			res.status(400).send({ errors });
			return;
		}

		const links = await this.server.prisma.url.findMany({ where: { domain: domain.domain } });
		const strategy = domain.nameStrategy === "name" ? "id" : domain.nameStrategy;
		let path = typeof body.name === "string" ? body.name : "";

		// Generate a random ID that does not exist
		if (!path.length || links.find((link) => link.id === path)) {
			path = Utils.generateId(strategy, domain.nameLength) as string;
			while (links.find((link) => link.id === path)) path = Utils.generateId(strategy, domain.nameLength) as string;
		}

		try {
			const url = await this.server.prisma.url.create({
				data: { date: new Date(), url: body.url, id: path, visible: body.visible, domain: domain.domain }
			});
			res.send({ url: `${Utils.getProtocol()}${domain.domain}/r/${path}`, date: url.date, visible: url.visible });
		} catch (err) {
			this.server.logger.fatal("[URL:CREATE]: Fatal error while creating a shorturl", err);
			res.status(500).send({
				errors: [
					{
						field: null,
						code: "INTERNAL_SERVER_ERROR",
						message: "Unknown error occurred while creating a new shorturl, please try again later."
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
			url: z
				.string({ required_error: "url is a required parameter", invalid_type_error: "Property 'url' must be a string" })
				.url("The provided url is invalid"),
			name: z
				.string({ invalid_type_error: "Property 'name' must be a string" })
				.refine((arg) => !arg.includes("/"), "Name cannot contain a slash (/)")
				.optional(),
			visible: z.boolean({ required_error: "Visibility state is required", invalid_type_error: "Property 'visible' must be a boolean" })
		});

		try {
			return schema.parse(body);
		} catch (error) {
			return error as ZodError;
		}
	}
}

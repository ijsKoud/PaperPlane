import type Domain from "#components/Domain.js";
import type Server from "#server.js";
import { ApplyOptions, Route, methods } from "@snowcrystals/highway";
import type { NextFunction, Request, Response } from "express";

@ApplyOptions<Route.Options>({ ratelimit: { max: 20, windowMs: 1e3 }, middleware: [[methods.GET, "user-api-key"]] })
export default class ApiRoute extends Route<Server> {
	public async [methods.GET](req: Request, res: Response, next: NextFunction, { domain }: Record<"domain", Domain>) {
		const name = req.params.id;

		try {
			const url = await this.server.prisma.url.findFirst({ where: { id: name, domain: domain.domain } });
			if (!url) {
				res.status(404).send({
					errors: [{ field: "name", code: "URL_NOT_FOUND", message: "A shorturl with the provided name does not exist" }]
				});
				return;
			}

			res.status(200).json(url);
		} catch (err) {
			this.server.logger.fatal("[URL:CREATE]: Fatal error while fetching a shorturl", err);
			res.status(500).send({
				errors: [
					{
						field: null,
						code: "INTERNAL_SERVER_ERROR",
						message: "Unknown error occurred while fetching a shorturl, please try again later."
					}
				]
			});
		}
	}
}

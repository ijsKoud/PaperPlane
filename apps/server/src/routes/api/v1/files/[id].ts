import type Domain from "#components/Domain.js";
import type Server from "#server.js";
import { ApplyOptions, Route, methods } from "@snowcrystals/highway";
import type { NextFunction, Request, Response } from "express";
import _ from "lodash";

@ApplyOptions<Route.Options>({ ratelimit: { max: 20, windowMs: 1e3 }, middleware: [[methods.GET, "user-api-key"]] })
export default class ApiRoute extends Route<Server> {
	public async [methods.GET](req: Request, res: Response, next: NextFunction, { domain }: Record<"domain", Domain>) {
		const name = req.params.id;

		try {
			const file = await this.server.prisma.file.findFirst({ where: { id: name, domain: domain.domain } });
			if (!file) {
				res.status(404).send({
					errors: [{ field: "name", code: "FILE_NOT_FOUND", message: "A file with the provided name does not exist" }]
				});
				return;
			}

			const filtered = _.pick(file, ["domain", "date", "mimeType", "id", "visible", "size", "views", "password"]);
			res.status(200).json({ ...filtered, password: Boolean(filtered.password) });
		} catch (err) {
			this.server.logger.fatal("[FILE:CREATE]: Fatal error while fetching a file", err);
			res.status(500).send({
				errors: [
					{
						field: null,
						code: "INTERNAL_SERVER_ERROR",
						message: "Unknown error occurred while fetching a file, please try again later."
					}
				]
			});
		}
	}
}

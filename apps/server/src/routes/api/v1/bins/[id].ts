import type Domain from "#components/Domain.js";
import type Server from "#server.js";
import { ApplyOptions, Route, methods } from "@snowcrystals/highway";
import type { NextFunction, Request, Response } from "express";
import { readFile } from "node:fs/promises";
import _ from "lodash";

@ApplyOptions<Route.Options>({ ratelimit: { max: 20, windowMs: 1e3 }, middleware: [[methods.GET, "user-api-key"]] })
export default class ApiRoute extends Route<Server> {
	public async [methods.GET](req: Request, res: Response, next: NextFunction, { domain }: Record<"domain", Domain>) {
		const name = req.params.id;

		try {
			const pastebin = await this.server.prisma.pastebin.findFirst({ where: { id: name, domain: domain.domain } });
			if (!pastebin) {
				res.status(404).send({
					errors: [{ field: "name", code: "BIN_NOT_FOUND", message: "A pastebin with the provided name does not exist" }]
				});
				return;
			}

			const content = await readFile(pastebin.path, "utf-8");
			const filtered = _.pick(pastebin, ["date", "domain", "highlight", "id", "views", "visible"]);
			res.status(200).json({ ...filtered, content });
		} catch (err) {
			this.server.logger.fatal("[PASTEBIN:CREATE]: Fatal error while fetching a pastebin", err);
			res.status(500).send({
				errors: [
					{
						field: null,
						code: "INTERNAL_SERVER_ERROR",
						message: "Unknown error occurred while fetching a pastebin, please try again later."
					}
				]
			});
		}
	}
}

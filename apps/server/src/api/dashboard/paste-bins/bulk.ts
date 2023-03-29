import type { Response } from "express";
import { Auth } from "../../../lib/Auth.js";
import type { DashboardRequest, BinsBulkDeleteFormBody, Middleware, RequestMethods } from "../../../lib/types.js";
import type Server from "../../../Server.js";

export default async function handler(server: Server, req: DashboardRequest, res: Response) {
	if (!req.locals.domain) {
		res.status(500).send({ message: "Internal server error, please try again later." });
		return;
	}

	if (req.method === "DELETE") {
		const data = req.body as BinsBulkDeleteFormBody;
		if (!Array.isArray(data.bins)) {
			res.status(400).send({ message: "Invalid bins array provided" });
			return;
		}

		const bins = data.bins.filter((bin) => typeof bin === "string");
		await server.prisma.pastebin.deleteMany({ where: { id: { in: bins }, domain: req.locals.domain.domain } });
		req.locals.domain.auditlogs.register("Pastebins Deleted", `Ids: ${bins.join(", ")}`);

		res.sendStatus(204);
	}
}

export const methods: RequestMethods[] = ["delete"];
export const middleware: Middleware[] = [Auth.userMiddleware.bind(Auth)];

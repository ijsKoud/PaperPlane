import type { Response } from "express";
import { Auth } from "../../../lib/Auth.js";
import type { DashboardRequest, UrlsBulkDeleteFormBody, Middleware, RequestMethods } from "../../../lib/types.js";
import type Server from "../../../Server.js";

export default async function handler(server: Server, req: DashboardRequest, res: Response) {
	if (!req.locals.domain) {
		res.status(500).send({ message: "Internal server error, please try again later." });
		return;
	}

	if (req.method === "DELETE") {
		const data = req.body as UrlsBulkDeleteFormBody;
		if (!Array.isArray(data.urls)) {
			res.status(400).send({ message: "Invalid urls array provided" });
			return;
		}

		const urls = data.urls.filter((url) => typeof url === "string");
		await server.prisma.url.deleteMany({ where: { id: { in: urls }, domain: req.locals.domain.domain } });
		res.sendStatus(204);
	}
}

export const methods: RequestMethods[] = ["delete"];
export const middleware: Middleware[] = [Auth.userMiddleware.bind(Auth)];

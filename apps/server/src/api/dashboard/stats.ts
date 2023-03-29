import type { Response } from "express";
import { Auth } from "../../lib/Auth.js";
import type { DashboardRequest, Middleware, RequestMethods } from "../../lib/types.js";
import type Server from "../../Server.js";

export default async function handler(server: Server, req: DashboardRequest, res: Response) {
	if (!req.locals.domain) {
		res.status(500).send({ message: "Internal server error, please try again later." });
		return;
	}

	const files = await server.prisma.file.count({ where: { domain: req.locals.domain.domain } });
	const shorturls = await server.prisma.url.count({ where: { domain: req.locals.domain.domain } });
	const pastebins = await server.prisma.pastebin.count({ where: { domain: req.locals.domain.domain } });

	res.send({
		files,
		shorturls,
		pastebins,
		storage: {
			total: req.locals.domain.maxStorage,
			used: req.locals.domain.storage
		}
	});
}

export const methods: RequestMethods[] = ["get"];
export const middleware: Middleware[] = [Auth.userMiddleware.bind(Auth)];

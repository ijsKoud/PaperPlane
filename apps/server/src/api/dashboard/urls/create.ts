import type { Response } from "express";
import { Auth } from "../../../lib/Auth.js";
import { type DashboardRequest, type Middleware, type RequestMethods } from "../../../lib/types.js";
import { Utils } from "../../../lib/utils.js";
import type Server from "../../../Server.js";

export default async function handler(server: Server, req: DashboardRequest, res: Response) {
	if (!req.locals.domain) {
		res.status(500).send({ message: "Internal server error, please try again later." });
		return;
	}

	const { name, visible, url } = req.body;
	if (typeof url !== "string" || typeof visible !== "boolean") {
		res.status(400).send({ message: "No shorturl data provided" });
		return;
	}

	const links = await server.prisma.url.findMany({ where: { domain: req.locals.domain.domain } });
	const strategy = req.locals.domain.nameStrategy === "name" ? "id" : req.locals.domain.nameStrategy;
	let path = typeof name === "string" ? name : "";

	if (!path.length || links.find((link) => link.id === path)) {
		path = Utils.generateId(strategy, req.locals.domain.nameLength) as string;
		while (links.find((link) => link.id === path)) path = Utils.generateId(strategy, req.locals.domain.nameLength) as string;
	}

	try {
		await server.prisma.url.create({ data: { date: new Date(), url, id: path, visible, domain: req.locals.domain.domain } });
		res.send(`${Utils.getProtocol()}${req.locals.domain.domain}/r/${path}`);
	} catch (err) {
		server.logger.fatal(`[UPLOAD:POST]: Fatal error while uploading a shorturl`, err);
		res.status(500).send({ message: "Internal server error occured, please try again later." });
	}
}

export const methods: RequestMethods[] = ["post"];
export const middleware: Middleware[] = [Auth.userMiddleware.bind(Auth)];

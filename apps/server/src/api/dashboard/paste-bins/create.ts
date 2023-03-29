import type { Response } from "express";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { Auth } from "../../../lib/Auth.js";
import type { DashboardRequest, BinCreateFormBody, Middleware, RequestMethods } from "../../../lib/types.js";
import { Utils } from "../../../lib/utils.js";
import type Server from "../../../Server.js";

export default async function handler(server: Server, req: DashboardRequest, res: Response) {
	if (!req.locals.domain) {
		res.status(500).send({ message: "Internal server error, please try again later." });
		return;
	}

	const bins = await server.prisma.pastebin.findMany({ where: { domain: req.locals.domain.domain } });
	const data = req.body as BinCreateFormBody;
	if (data.name && (typeof data.name !== "string" || data.name.includes(".") || data.name.includes("/"))) {
		res.status(400).send({ message: "Invalid pastebin name provided" });
		return;
	}

	if (typeof data.highlight !== "string" || data.highlight.includes(".") || data.highlight.includes("/")) {
		res.status(400).send({ message: "Invalid pastebin highlight provided" });
		return;
	}

	if (typeof data.data !== "string" || !data.data.length) {
		res.status(400).send({ message: "Invalid pastebin data provided" });
		return;
	}

	if (typeof data.visible !== "boolean") {
		res.status(400).send({ message: "Invalid visible value provided" });
		return;
	}

	try {
		const path = join(req.locals.domain.pastebinPath, `${Auth.generateToken(32)}.txt`);
		const id =
			Utils.generateId(req.locals.domain.nameStrategy, req.locals.domain.nameLength) ||
			(Utils.generateId("id", req.locals.domain.nameLength) as string);

		const authBuffer = Buffer.from(`${Auth.generateToken(32)}.${Date.now()}.${req.locals.domain.domain}.${id}`).toString("base64");
		const authSecret = Auth.encryptToken(authBuffer, server.envConfig.encryptionKey);

		await writeFile(path, data.data);

		await server.prisma.pastebin.create({
			data: {
				visible: data.visible,
				id: data.name ? (bins.map((bin) => bin.id).includes(data.name) ? id : data.name) : id,
				date: new Date(),
				domain: req.locals.domain.domain,
				path,
				highlight: data.highlight,
				authSecret
			}
		});

		res.sendStatus(204);
	} catch (err) {
		server.logger.fatal(`[PASTEBIN:CREATE]: Fatal error while updating a bin `, err);
		res.status(500).send({ message: "Internal server error occured, please try again later." });
	}
}

export const methods: RequestMethods[] = ["post"];
export const middleware: Middleware[] = [Auth.userMiddleware.bind(Auth)];

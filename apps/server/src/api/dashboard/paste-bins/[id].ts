import type { Response } from "express";
import { readFile, writeFile } from "node:fs/promises";
import { Auth } from "../../../lib/Auth.js";
import type { DashboardRequest, BinEditFormBody, Middleware, RequestMethods } from "../../../lib/types.js";
import type Server from "../../../Server.js";

export default async function handler(server: Server, req: DashboardRequest, res: Response) {
	const { id } = req.params;
	if (!req.locals.domain) {
		res.status(500).send({ message: "Internal server error, please try again later." });
		return;
	}

	if (req.method === "PUT") {
		const bins = await server.prisma.pastebin.findMany({ where: { domain: req.locals.domain.domain } });
		const data = req.body as BinEditFormBody;
		if (typeof data.name !== "string" || data.name.includes(".") || data.name.includes("/")) {
			res.status(400).send({ message: "Invalid pastebin name provided" });
			return;
		}

		if (typeof data.highlight !== "string" || data.highlight.includes(".") || data.highlight.includes("/")) {
			res.status(400).send({ message: "Invalid pastebin highlight provided" });
			return;
		}

		if (typeof data.passwordEnabled !== "boolean") {
			res.status(400).send({ message: "Invalid passwordEnabled value provided" });
			return;
		}

		if (typeof data.visible !== "boolean") {
			res.status(400).send({ message: "Invalid visible value provided" });
			return;
		}

		try {
			const bin = await server.prisma.pastebin.update({
				where: { id_domain: { domain: req.locals.domain.domain, id } },
				data: {
					password: data.password
						? Auth.encryptPassword(data.password, server.envConfig.encryptionKey)
						: data.passwordEnabled
						? undefined
						: null,
					visible: data.visible,
					id: bins.map((bin) => bin.id).includes(data.name) ? undefined : data.name,
					highlight: data.highlight
				}
			});

			if (typeof data.data === "string" && data.data.length) await writeFile(bin.path, data.data);

			res.sendStatus(204);
		} catch (err) {
			server.logger.fatal(`[PASTEBIN:POST]: Fatal error while updating a bin `, err);
			res.status(500).send({ message: "Internal server error occured, please try again later." });
		}

		return;
	}

	const bin = await server.prisma.pastebin.findUnique({ where: { id_domain: { domain: req.locals.domain.domain, id } } });
	if (!bin) {
		res.status(404).send({ message: "Unable to find requested paste-bin" });
		return;
	}

	try {
		const file = await readFile(bin.path, "utf-8");
		res.status(200).send(file);
	} catch (err) {
		server.logger.fatal(`[PASTEBIN:GET]: Fatal error while getting a bin `, err);
		res.status(500).send({ message: "Internal server error occured, please try again later." });
	}
}

export const methods: RequestMethods[] = ["put", "get"];
export const middleware: Middleware[] = [Auth.userMiddleware.bind(Auth)];

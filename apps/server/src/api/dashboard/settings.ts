import type { Response } from "express";
import { Auth } from "../../lib/Auth.js";
import type { DashboardRequest, Middleware, RequestMethods, UpdateDashboardSettingsFormBody } from "../../lib/types.js";
import type Server from "../../Server.js";

export default async function handler(server: Server, req: DashboardRequest, res: Response) {
	if (!req.locals.domain) {
		res.status(500).send({ message: "Internal server error, please try again later." });
		return;
	}

	if (req.method === "GET") {
		res.send({
			tokens: req.locals.domain.apiTokens.map((token) => ({ name: token.name, date: token.date })),
			nameLength: req.locals.domain.nameLength,
			nameStrategy: req.locals.domain.nameStrategy
		});

		return;
	}

	if (req.method === "POST") {
		try {
			const data = req.body as UpdateDashboardSettingsFormBody;
			if (!["id", "zerowidth", "name"].includes(data.nameStrategy)) {
				res.status(400).send({ message: "Invalid nameStrategy provided" });
				return;
			}

			if (typeof data.nameLength !== "number" || data.nameLength < 4) {
				res.status(400).send({ message: "Invalid nameLength provided" });
				return;
			}

			await req.locals.domain.update(data);
			req.locals.domain.auditlogs.register("Settings Update", `Length: ${data.nameLength}, strategy: ${data.nameStrategy}`);
			res.sendStatus(204);
			return;
		} catch (err) {
			server.logger.fatal(`[SETTINGS:POST]: Fatal error while updating a PaperPlane account `, err);
			res.status(500).send({ message: "Internal server error occured, please try again later." });
		}
	}
}

export const methods: RequestMethods[] = ["get", "post"];
export const middleware: Middleware[] = [Auth.userMiddleware.bind(Auth)];

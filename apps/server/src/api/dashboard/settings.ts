import type { Response } from "express";
import ms from "ms";
import { Auth } from "../../lib/Auth.js";
import type { DashboardRequest, Middleware, RequestMethods, UpdateSettingsFormBody } from "../../lib/types.js";
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
			const data = req.body as UpdateSettingsFormBody;
			if (!["block", "pass"].includes(data.extensionsMode)) {
				res.status(400).send({ message: "Invalid extensionMode provided" });
				return;
			}
			if (!["2fa", "password"].includes(data.authMode)) {
				res.status(400).send({ message: "Invalid authMode provided" });
				return;
			}
			if (!["open", "closed", "invite"].includes(data.signUpMode)) {
				res.status(400).send({ message: "Invalid signUpMode provided" });
				return;
			}
			const auditlog = ms(data.auditlog);
			if (isNaN(auditlog)) {
				res.status(400).send({ message: "Invalid auditlog duration provided" });
				return;
			}
			data.extensions = data.extensions.filter((ext) => ext.startsWith(".") && !ext.endsWith("."));
			await server.config.update(data);
			if (server.envConfig.authMode !== data.authMode) await server.domains.resetAuth();
			server.adminAuditLogs.register("Default Settings Update", "N/A");
			res.sendStatus(204);
			return;
		} catch (err) {
			server.logger.fatal(`[CREATE:POST]: Fatal error while creating a new PaperPlane account `, err);
			res.status(500).send({ message: "Internal server error occured, please try again later." });
		}
	}
}

export const methods: RequestMethods[] = ["get", "post"];
export const middleware: Middleware[] = [Auth.userMiddleware.bind(Auth)];

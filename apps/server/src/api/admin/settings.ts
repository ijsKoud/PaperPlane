import type { Response, Request } from "express";
import ms from "ms";
import { Auth } from "../../lib/Auth.js";
import type { Middleware, RequestMethods, UpdateSettingsFormBody } from "../../lib/types.js";
import type Server from "../../Server.js";

export default async function handler(server: Server, req: Request, res: Response) {
	const domains = await server.prisma.signupDomain.findMany();

	if (req.method === "GET") {
		res.send({
			defaults: {
				authMode: server.envConfig.authMode,
				signUpMode: server.envConfig.signUpMode,
				extensions: server.envConfig.extensionsList,
				extensionsMode: server.envConfig.extensionsMode,
				maxStorage: server.envConfig.maxStorage,
				maxUploadSize: server.envConfig.maxUpload,
				auditlog: server.envConfig.auditLogDuration
			},
			domains
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
export const middleware: Middleware[] = [Auth.adminMiddleware.bind(Auth)];

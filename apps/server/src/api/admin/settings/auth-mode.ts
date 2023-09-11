import type { Response, Request } from "express";
import { Auth } from "../../../lib/Auth.js";
import type { Middleware, RequestMethods } from "../../../lib/types.js";
import type Server from "../../../Server.js";

export default async function handler(server: Server, req: Request, res: Response) {
	if (req.method === "GET") {
		res.send(server.envConfig.authMode);
		return;
	}

	if (req.method === "POST") {
		try {
			const data = req.body as { mode: "2fa" | "password" };
			if (!["2fa", "password"].includes(data.mode)) {
				res.status(400).send({ message: "Invalid mode provided" });
				return;
			}

			if (server.envConfig.authMode !== data.mode) await server.domains.resetAuth();
			server.adminAuditLogs.register("Default Settings Update", "N/A");
			res.sendStatus(204);
		} catch (err) {
			server.logger.fatal(`[AUTH-MODE:POST]: Fatal error while creating a new PaperPlane account `, err);
			res.status(500).send({ message: "Internal server error occured, please try again later." });
		}
	}
}

export const methods: RequestMethods[] = ["get", "post"];
export const middleware: Middleware[] = [Auth.adminMiddleware.bind(Auth)];

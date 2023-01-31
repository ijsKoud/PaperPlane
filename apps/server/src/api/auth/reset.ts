import type { Response } from "express";
import { Auth } from "../../lib/Auth.js";
import type { DashboardRequest, Middleware, RequestMethods } from "../../lib/types.js";
import type Server from "../../Server.js";

export default async function handler(server: Server, req: DashboardRequest, res: Response) {
	if (!req.locals.domain) {
		res.status(500).send({ message: "Internal server error, please try again later." });
		return;
	}

	if (req.method === "POST") {
		if (server.envConfig.authMode === "2fa") {
			const auth = server.auth.generateAuthReset(req.locals.domain.domain);
			res.send(auth);
			return;
		}

		res.send({ key: "", secret: "", uri: "" });
		return;
	}

	if (req.method === "PATCH") {
		const data = req.body as { key?: string; auth: string };
		if (server.envConfig.authMode === "2fa") {
			if (typeof data.key !== "string" || !server.auth.authReset.has(data.key)) {
				res.status(400).send({ message: "Missing 2FA key, please refresh the page" });
				return;
			}

			if (typeof data.auth !== "string" || data.auth.length !== 6) {
				res.status(400).send({ message: "Invalid 2FA code provided" });
				return;
			}

			const authData = server.auth.authReset.get(data.key)!;
			const authRes = Auth.verify2FASecret(authData.token, data.auth);

			if (!authRes || authRes.delta !== 0) {
				res.status(400).send({ message: "Invalid 2FA code provided" });
				return;
			}

			const codes = Auth.generateBackupCodes();
			await req.locals.domain.update({ twoFactorSecret: authData.token, backupCodes: codes.join(",") });

			clearTimeout(authData.timeout);
			server.auth.authReset.delete(data.key);

			res.send(codes);
		}
	}
}

export const methods: RequestMethods[] = ["post", "patch"];
export const middleware: Middleware[] = [Auth.userMiddleware.bind(Auth)];

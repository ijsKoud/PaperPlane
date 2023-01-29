import type { Response, Request } from "express";
import { scryptSync, timingSafeEqual } from "node:crypto";
import { AuditLog } from "../../lib/AuditLog.js";
import { Auth } from "../../lib/Auth.js";
import type { RequestMethods } from "../../lib/types.js";
import type Server from "../../Server.js";

export default function handler(server: Server, req: Request, res: Response) {
	const { domain: _domain, code, password } = req.body ?? {};

	if (typeof _domain !== "string") {
		res.status(400).send({ message: "Invalid domain provided" });
		return;
	}

	const domain = server.domains.get(_domain);
	if (!domain && _domain !== "admin") {
		res.status(400).send({ message: "Invalid domain provided" });
		return;
	}

	if (typeof code === "string" && code.startsWith("BC-")) {
		// TODO: use back-up code
		res.status(400).send({ message: "Invalid account provided" });
		return;
	}

	const ua = AuditLog.getUserAgentData(req.headers["user-agent"]);

	if (code) {
		if (typeof code !== "string" || code.length !== 6) {
			res.status(400).send({ message: "Invalid Two Factor Authentication code provided" });
			return;
		}

		if (_domain === "admin") {
			const authSecret = server.envConfig.admin2FASecret;
			const authRes = Auth.verify2FASecret(authSecret, code);
			if (!authRes || authRes.delta !== 0) {
				res.status(400).send({ message: "Invalid Two Factor Authentication code provided" });
				return;
			}

			server.adminAuditLogs.register("Login", `${ua.browser.name}-${ua.browser.version} on ${ua.os.name}-${ua.os.version}`);
			res.cookie("PAPERPLANE-ADMIN", Auth.createJWTToken("admin", server.envConfig.encryptionKey), { maxAge: 6.048e8 });
			res.sendStatus(204);
			return;
		}

		const authSecret = domain!.secret;
		if (!authSecret.length) {
			res.status(400).send({ message: "Invalid account provided" });
			return;
		}

		const authRes = Auth.verify2FASecret(authSecret, code);
		if (!authRes || authRes.delta !== 0) {
			res.status(400).send({ message: "Invalid Two Factor Authentication code provided" });
			return;
		}

		res.cookie(`PAPERPLANE-AUTH`, Auth.createJWTToken(domain!.domain, server.envConfig.encryptionKey), { maxAge: 6.048e8 });
		res.sendStatus(204);

		res.sendStatus(204);
		return;
	}

	if (typeof password !== "string") {
		res.status(400).send({ message: "Invalid Password provided" });
		return;
	}

	const [salt, key] = Auth.decryptToken(domain!.secret, server.envConfig.encryptionKey).split(":");
	const passwordBuffer = scryptSync(password, salt, 64);

	const keyBuffer = Buffer.from(key, "hex");
	const match = timingSafeEqual(passwordBuffer, keyBuffer);
	if (!match) {
		res.status(400).send({ message: "Invalid Password provided" });
		return;
	}

	res.cookie("PAPERPLANE-AUTH", Auth.createJWTToken(domain!.domain, server.envConfig.encryptionKey), { maxAge: 6.048e8 });
	res.sendStatus(204);
}

export const methods: RequestMethods[] = ["post"];

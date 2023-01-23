import type { Response, Request } from "express";
import { scryptSync, timingSafeEqual } from "node:crypto";
import { Auth } from "../../lib/Auth.js";
import type { RequestMethods } from "../../lib/types.js";
import type Server from "../../Server.js";

export default async function handler(server: Server, req: Request, res: Response) {
	const { domain: _domain, code, password } = req.body ?? {};

	if (typeof _domain !== "string") {
		res.status(400).send({ message: "Invalid domain provided" });
		return;
	}

	const domain = await server.prisma.domain.findFirst({ where: { domain: _domain, disabled: false } });
	if (!domain && _domain !== "admin") {
		res.status(400).send({ message: "Invalid domain provided" });
		return;
	}

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

			res.cookie("PAPERPLANE-ADMIN", Auth.createJWTToken("admin", server.envConfig.encryptionKey), { maxAge: 6.048e8 });
			res.sendStatus(204);
			return;
		}

		const authSecret = domain!.twoFactorSecret!;
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

	const [salt, key] = Auth.decryptToken(domain!.password!, server.envConfig.encryptionKey).split(":");
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

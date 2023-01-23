import type { Response, Request } from "express";
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
			const authSecret = server._config.config.admin2FASecret;
			const authRes = Auth.verify2FASecret(authSecret, code);
			if (!authRes || authRes.delta !== 0) {
				res.status(400).send({ message: "Invalid Two Factor Authentication code provided" });
				return;
			}

			res.cookie("PAPERPLANE-ADMIN", Auth.createJWTToken("admin", server._config.config.encryptionKey), { maxAge: 6.048e8 });
			res.sendStatus(204);
			return;
		}

		const authSecret = domain!.twoFactorSecret!;
		const authRes = Auth.verify2FASecret(authSecret, code);
		if (!authRes || authRes.delta !== 0) {
			res.status(400).send({ message: "Invalid Two Factor Authentication code provided" });
			return;
		}

		res.cookie(`PAPERPLANE-${domain!.domain}`, Auth.createJWTToken(domain!.domain, server._config.config.encryptionKey), { maxAge: 6.048e8 });
		res.sendStatus(204);

		res.sendStatus(204);
		return;
	}

	if (typeof password !== "string") {
		res.status(400).send({ message: "Invalid Password provided" });
		return;
	}

	res.sendStatus(204);
}

export const methods: RequestMethods[] = ["post"];

import { scryptSync, timingSafeEqual } from "crypto";
import type { Request, Response } from "express";
import { readFile } from "fs/promises";
import { Auth } from "../../lib/Auth.js";
import type { Middleware, RequestMethods } from "../../lib/types.js";
import type Server from "../../Server.js";

export default async function handler(server: Server, req: Request, res: Response) {
	const proxyHost = req.headers["x-forwarded-host"];
	const hostName = proxyHost ? proxyHost : req.headers.host ?? req.hostname;
	const host = server.domains.domains.find((dm) => dm.domain.startsWith(Array.isArray(hostName) ? hostName[0] : hostName));

	const { id: _id } = req.params;
	const [id] = _id.split(".");
	const pastebin = await server.prisma.pastebin.findFirst({ where: { domain: host?.domain ?? "", id } });

	if (!pastebin) {
		res.send({ data: "", highlight: "" });
		return;
	}

	if (req.method === "GET") {
		const checkForPassword = () => {
			const authCookie: string = req.cookies[`PAPERPLANE-${pastebin.id}`] ?? "";
			if (!authCookie.length) return false;

			const verify = Auth.verifyJWTToken(authCookie, server.envConfig.encryptionKey, pastebin.authSecret);
			if (!verify) return false;

			return true;
		};

		if (pastebin.password && !checkForPassword()) {
			res.send(null);
			return;
		}

		const pastebinData = await readFile(pastebin.path, "utf-8").catch(() => "");
		res.send({ data: pastebinData, highlight: pastebin.highlight });
		return;
	}

	const data = req.body as { password: string };
	if (typeof data.password !== "string") {
		res.status(400).send({ message: "Invalid password provided." });
		return;
	}

	try {
		if (!pastebin.password?.length) {
			res.sendStatus(204);
			return;
		}

		const [salt, key] = Auth.decryptToken(pastebin.password, server.envConfig.encryptionKey).split(":");
		const passwordBuffer = scryptSync(data.password, salt, 64);

		const keyBuffer = Buffer.from(key, "hex");
		const match = timingSafeEqual(passwordBuffer, keyBuffer);
		if (!match) {
			res.status(400).send({ message: "Invalid Password provided" });
			return;
		}

		const cookie = Auth.createJWTToken(pastebin.authSecret, server.envConfig.encryptionKey);
		res.cookie(`PAPERPLANE-${pastebin.id}`, cookie);
		res.sendStatus(204);
	} catch (err) {
		server.logger.fatal(`[PASTEBIN:POST]: Fatal error while processing auth request `, err);
		res.status(500).send({ message: "Internal server error occured, please try again later." });
	}
}

export const methods: RequestMethods[] = ["get", "post"];
export const middleware: Middleware[] = [];

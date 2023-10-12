import { Auth } from "#lib/Auth.js";
import Config from "#lib/Config.js";
import type Server from "#server.js";
import { ApplyOptions, Route, methods } from "@snowcrystals/highway";
import type { Request, Response } from "express";
import { readFile } from "node:fs/promises";
import { scryptSync, timingSafeEqual } from "node:crypto";

@ApplyOptions<Route.Options>({ ratelimit: { max: 25, windowMs: 1e3 } })
export default class ApiRoute extends Route<Server> {
	public async [methods.GET](req: Request, res: Response) {
		const config = Config.getEnv();
		const proxyHost = req.headers["x-forwarded-host"];
		const hostName = proxyHost ? proxyHost : req.headers.host ?? req.hostname;
		const host = this.server.domains.domains.find((dm) => dm.domain.startsWith(Array.isArray(hostName) ? hostName[0] : hostName));

		const { id } = req.params;
		const pastebin = await this.server.prisma.pastebin.findFirst({ where: { domain: host?.domain ?? "", id } });

		if (!pastebin) {
			res.send({ data: "", highlight: "" });
			return;
		}

		const checkForPassword = () => {
			const authCookie: string = req.cookies[`PAPERPLANE-${pastebin.id}`] ?? "";
			if (!authCookie.length) return false;

			const verify = Auth.verifyJWTToken(authCookie, config.encryptionKey, pastebin.authSecret);
			if (!verify) return false;

			return true;
		};

		if (pastebin.password && !checkForPassword()) {
			res.send(null);
			return;
		}

		const pastebinData = await readFile(pastebin.path, "utf-8").catch(() => "");
		res.send({ data: pastebinData, highlight: pastebin.highlight });
		host?.pastebins.add(pastebin.id);
	}

	public async [methods.POST](req: Request, res: Response) {
		const config = Config.getEnv();
		const proxyHost = req.headers["x-forwarded-host"];
		const hostName = proxyHost ? proxyHost : req.headers.host ?? req.hostname;
		const host = this.server.domains.domains.find((dm) => dm.domain.startsWith(Array.isArray(hostName) ? hostName[0] : hostName));

		const { id } = req.params;
		const pastebin = await this.server.prisma.pastebin.findFirst({ where: { domain: host?.domain ?? "", id } });

		if (!pastebin) {
			res.send({ data: "", highlight: "" });
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

			const [salt, key] = Auth.decryptToken(pastebin.password, config.encryptionKey).split(":");
			const passwordBuffer = scryptSync(data.password, salt, 64);

			const keyBuffer = Buffer.from(key, "hex");
			const match = timingSafeEqual(passwordBuffer, keyBuffer);
			if (!match) {
				res.status(400).send({ message: "Invalid Password provided" });
				return;
			}

			const cookie = Auth.createJWTToken(pastebin.authSecret, config.encryptionKey);
			res.cookie(`PAPERPLANE-${pastebin.id}`, cookie);
			res.sendStatus(204);
		} catch (err) {
			this.server.logger.fatal(`[PASTEBIN:POST]: Fatal error while processing auth request `, err);
			res.status(500).send({ message: "Internal server error occured, please try again later." });
		}
	}
}

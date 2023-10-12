import { Auth } from "#lib/Auth.js";
import Config from "#lib/Config.js";
import type Server from "#server.js";
import { ApplyOptions, Route, methods } from "@snowcrystals/highway";
import type { Request, Response } from "express";
import { readFile } from "node:fs/promises";
import { charset, lookup } from "mime-types";
import { scryptSync, timingSafeEqual } from "node:crypto";

@ApplyOptions<Route.Options>({ ratelimit: { max: 25, windowMs: 1e3 } })
export default class ApiRoute extends Route<Server> {
	public async [methods.GET](req: Request, res: Response) {
		const config = Config.getEnv();
		const proxyHost = req.headers["x-forwarded-host"];
		const hostName = proxyHost ? proxyHost : req.headers.host ?? req.hostname;
		const host = this.server.domains.domains.find((dm) => dm.domain.startsWith(Array.isArray(hostName) ? hostName[0] : hostName));

		const { id } = req.params;
		const file = await this.server.prisma.file.findFirst({ where: { domain: host?.domain ?? "", id } });

		const embed = host?.embedEnabled
			? {
					embedTitle: host?.embedTitle,
					embedDescription: host?.embedDescription,
					embedColor: host?.embedColor
			  }
			: {};

		if (!file) {
			res.send({ data: "", charset: "", isImage: false, ...embed });
			return;
		}

		const checkForPassword = () => {
			const authCookie: string = req.cookies[`PAPERPLANE-${file.id}`] ?? "";
			if (!authCookie.length) return false;

			const verify = Auth.verifyJWTToken(authCookie, config.encryptionKey, file.authSecret);
			if (!verify) return false;

			return true;
		};

		if (file.password && !checkForPassword()) {
			res.send(null);
			return;
		}

		const filename = file.path.split(/\//g).reverse()[0];
		const contentType = file.mimeType || lookup(filename) || "";

		let type = "unsupported";
		switch (contentType.split("/")[0]) {
			case "image":
				type = "image";
				break;
			case "video":
				type = "video";
				break;
			case "audio":
				type = "audio";
				break;
			default:
				break;
		}

		const fileData = await readFile(file.path, "utf-8").catch(() => "");
		res.send({ data: fileData, charset: charset(contentType) || "", type, ...embed });
	}

	public async [methods.POST](req: Request, res: Response) {
		const config = Config.getEnv();
		const proxyHost = req.headers["x-forwarded-host"];
		const hostName = proxyHost ? proxyHost : req.headers.host ?? req.hostname;
		const host = this.server.domains.domains.find((dm) => dm.domain.startsWith(Array.isArray(hostName) ? hostName[0] : hostName));

		const { id } = req.params;
		const file = await this.server.prisma.file.findFirst({ where: { domain: host?.domain ?? "", id } });

		const embed = host?.embedEnabled
			? {
					embedTitle: host?.embedTitle,
					embedDescription: host?.embedDescription,
					embedColor: host?.embedColor
			  }
			: {};

		if (!file) {
			res.send({ data: "", charset: "", isImage: false, ...embed });
			return;
		}

		const data = req.body as { password: string };
		if (typeof data.password !== "string") {
			res.status(400).send({ message: "Invalid password provided." });
			return;
		}

		try {
			if (!file.password?.length) {
				res.sendStatus(204);
				return;
			}

			const [salt, key] = Auth.decryptToken(file.password, config.encryptionKey).split(":");
			const passwordBuffer = scryptSync(data.password, salt, 64);

			const keyBuffer = Buffer.from(key, "hex");
			const match = timingSafeEqual(passwordBuffer, keyBuffer);
			if (!match) {
				res.status(400).send({ message: "Invalid Password provided" });
				return;
			}

			const cookie = Auth.createJWTToken(file.authSecret, config.encryptionKey);
			res.cookie(`PAPERPLANE-${file.id}`, cookie);
			res.sendStatus(204);
		} catch (err) {
			this.server.logger.fatal(`[FILES/ID:POST]: Fatal error while processing auth request `, err);
			res.status(500).send({ message: "Internal server error occured, please try again later." });
		}
	}
}

import { scryptSync, timingSafeEqual } from "crypto";
import type { Request, Response } from "express";
import { readFile } from "fs/promises";
import { charset, lookup } from "mime-types";
import { Auth } from "../../lib/Auth.js";
import type { Middleware, RequestMethods } from "../../lib/types.js";
import type Server from "../../Server.js";

export default async function handler(server: Server, req: Request, res: Response) {
	const proxyHost = req.headers["x-forwarded-host"];
	const hostName = proxyHost ? proxyHost : req.headers.host ?? req.hostname;
	const host = server.domains.domains.find((dm) => dm.domain.startsWith(Array.isArray(hostName) ? hostName[0] : hostName));

	const { id: _id } = req.params;
	const [id] = _id.split(".");
	const file = await server.prisma.file.findFirst({ where: { domain: host?.domain ?? "", id } });

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

	if (req.method === "GET") {
		const checkForPassword = () => {
			const authCookie: string = req.cookies[`PAPERPLANE-${file.id}`] ?? "";
			if (!authCookie.length) return false;

			const verify = Auth.verifyJWTToken(authCookie, server.envConfig.encryptionKey, file.authSecret);
			if (!verify) return false;

			return true;
		};

		if (file.password && !checkForPassword()) {
			res.send(null);
			return;
		}

		const filename = file.path.split(/\//g).reverse()[0];
		const contentType = lookup(filename) || "";

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

		const [salt, key] = Auth.decryptToken(file.password, server.envConfig.encryptionKey).split(":");
		const passwordBuffer = scryptSync(data.password, salt, 64);

		const keyBuffer = Buffer.from(key, "hex");
		const match = timingSafeEqual(passwordBuffer, keyBuffer);
		if (!match) {
			res.status(400).send({ message: "Invalid Password provided" });
			return;
		}

		const cookie = Auth.createJWTToken(file.authSecret, server.envConfig.encryptionKey);
		res.cookie(`PAPERPLANE-${file.id}`, cookie);
		res.sendStatus(204);
	} catch (err) {
		server.logger.fatal(`[FILES/ID:POST]: Fatal error while processing auth request `, err);
		res.status(500).send({ message: "Internal server error occured, please try again later." });
	}
}

export const methods: RequestMethods[] = ["get", "post"];
export const middleware: Middleware[] = [];

import type { Request, Response } from "express";
import { readFile } from "fs/promises";
import { charset, lookup } from "mime-types";
import type { Middleware, RequestMethods } from "../../lib/types.js";
import type Server from "../../Server.js";

export default async function handler(server: Server, req: Request, res: Response) {
	const proxyHost = req.headers["x-forwarded-host"];
	const hostName = proxyHost ? proxyHost : req.headers.host ?? req.hostname;
	const host = server.domains.domains.find((dm) => dm.domain.startsWith(Array.isArray(hostName) ? hostName[0] : hostName));

	const embed = host?.embedEnabled
		? {
				embedTitle: host?.embedTitle,
				embedDescription: host?.embedDescription,
				embedColor: host?.embedColor
		  }
		: {};

	const { id: _id } = req.params;
	const [id] = _id.split(".");
	const file = await server.prisma.file.findFirst({ where: { domain: host?.domain ?? "", id } });
	if (!file) {
		res.send({ data: "", charset: "", isImage: false, ...embed });
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
}

export const methods: RequestMethods[] = ["get"];
export const middleware: Middleware[] = [];

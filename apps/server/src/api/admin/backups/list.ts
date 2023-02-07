import type { Response, Request } from "express";
import { readdir } from "node:fs/promises";
import Fuse from "fuse.js";
import { Auth } from "../../../lib/Auth.js";
import type { Middleware, RequestMethods } from "../../../lib/types.js";
import { Utils } from "../../../lib/utils.js";
import type Server from "../../../Server.js";
import { join } from "node:path";

export default async function handler(server: Server, req: Request, res: Response) {
	const { search: _search, page: _page } = req.query;
	const page = isNaN(Number(_page)) ? 0 : Number(_page);
	const searchQ = (Array.isArray(_search) ? _search[0] : _search ?? "") as string;

	let entries = await readdir(join(server.backups.baseBackupFolder, "archives"));
	if (searchQ.length) {
		const search = new Fuse(entries, {
			keys: ["name"],
			isCaseSensitive: false
		});
		entries = search.search(searchQ).map((sr) => sr.item);
	}

	const chunks = Utils.chunk(entries, 50);
	const chunk = page > chunks.length ? chunks[chunks.length - 1] : chunks[page];

	res.send({
		pages: chunks.length,
		entries: chunk ?? []
	});
}

export const methods: RequestMethods[] = ["get"];
export const middleware: Middleware[] = [Auth.adminMiddleware.bind(Auth)];

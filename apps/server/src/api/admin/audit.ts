import type { Response, Request } from "express";
import Fuse from "fuse.js";
import { Auth } from "../../lib/Auth.js";
import type { Middleware, RequestMethods } from "../../lib/types.js";
import { Utils } from "../../lib/utils.js";
import type Server from "../../Server.js";

export default function handler(server: Server, req: Request, res: Response) {
	const { search: _search, page: _page } = req.query;
	const page = isNaN(Number(_page)) ? 0 : Number(_page);
	const searchQ = (Array.isArray(_search) ? _search[0] : _search ?? "") as string;

	let entries = server.adminAuditLogs.logs.map((log) => ({ details: log.details, date: log.date, type: log.type }));
	if (searchQ.length) {
		const search = new Fuse(entries, {
			keys: ["type", "date", "details"],
			isCaseSensitive: false
		});
		entries = search.search(searchQ).map((sr) => sr.item);
	}

	entries = entries.sort((a, b) => b.date.getTime() - a.date.getTime());
	const chunks = Utils.chunk(entries, 50);
	const chunk = page > chunks.length ? chunks[chunks.length - 1] : chunks[page];

	res.send({
		pages: chunks.length,
		entries: chunk ?? []
	});
}

export const methods: RequestMethods[] = ["get"];
export const middleware: Middleware[] = [Auth.adminMiddleware.bind(Auth)];

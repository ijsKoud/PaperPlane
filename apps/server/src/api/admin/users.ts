import type { Response, Request } from "express";
import Fuse from "fuse.js";
import { Auth } from "../../lib/Auth.js";
import { AdminUserSort, Middleware, RequestMethods } from "../../lib/types.js";
import { Utils } from "../../lib/utils.js";
import type Server from "../../Server.js";

export default function handler(server: Server, req: Request, res: Response) {
	const { search: _search, page: _page, sort: _sort } = req.query;
	const page = isNaN(Number(_page)) ? 0 : Number(_page);
	const searchQ = (Array.isArray(_search) ? _search[0] : _search ?? "") as string;
	const sort = AdminUserSort[Number(_sort)] ? Number(_sort) : AdminUserSort.DATE_NEW_OLD;

	let entries = [...server.domains.getAll(true).values()];
	if (searchQ.length) {
		const search = new Fuse(entries, {
			keys: ["domain"],
			isCaseSensitive: false
		});
		entries = search.search(searchQ).map((sr) => sr.item);
	}

	const sorted = Utils.userSort(entries, sort).map((domain) => domain.toJSON());
	const chunks = Utils.chunk(sorted, 50);
	const chunk = page > chunks.length ? chunks[chunks.length - 1] : chunks[page];

	res.send({
		pages: chunks.length,
		entries: chunk ?? []
	});
}

export const methods: RequestMethods[] = ["get"];
export const middleware: Middleware[] = [Auth.adminMiddleware.bind(Auth)];

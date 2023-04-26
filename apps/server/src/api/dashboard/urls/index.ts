import type { Response } from "express";
import Fuse from "fuse.js";
import { Auth } from "../../../lib/Auth.js";
import { type DashboardRequest, type Middleware, type RequestMethods, UrlsSort } from "../../../lib/types.js";
import { Utils } from "../../../lib/utils.js";
import type Server from "../../../Server.js";

interface ApiUrl {
	name: string;
	url: string;
	redirect: string;

	date: Date;
	visible: boolean;
	visits: number;
}

export default async function handler(server: Server, req: DashboardRequest, res: Response) {
	const { search: _search, page: _page, sort: _sort } = req.query;
	const page = isNaN(Number(_page)) ? 0 : Number(_page);
	const searchQ = (Array.isArray(_search) ? _search[0] : _search ?? "") as string;
	const sort = UrlsSort[Number(_sort)] ? Number(_sort) : UrlsSort.DATE_NEW_OLD;

	let entries = await server.prisma.url.findMany({ where: { domain: req.locals.domain.domain } });
	if (searchQ.length) {
		const search = new Fuse(entries, {
			keys: ["id", "url", "visits"],
			isCaseSensitive: false
		});
		entries = search.search(searchQ).map((sr) => sr.item);
	}

	const sorted = Utils.urlSort(entries, sort);
	const chunks = Utils.chunk(sorted, 50);
	const chunk = (page > chunks.length ? chunks[chunks.length - 1] : chunks[page]) ?? [];

	const mapped = chunk.map<ApiUrl>((url) => ({
		name: url.id,
		date: url.date,
		visits: url.visits,
		visible: url.visible,
		redirect: url.url,
		url: `${Utils.getProtocol()}${req.locals.domain}/r/${url.id}`
	}));

	res.send({
		pages: chunks.length,
		entries: mapped
	});
}

export const methods: RequestMethods[] = ["get"];
export const middleware: Middleware[] = [Auth.userMiddleware.bind(Auth)];

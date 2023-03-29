import type { Response } from "express";
import Fuse from "fuse.js";
import { Auth } from "../../../lib/Auth.js";
import { DashboardRequest, BinSort, Middleware, RequestMethods } from "../../../lib/types.js";
import { Utils } from "../../../lib/utils.js";
import type Server from "../../../Server.js";

interface ApiBin {
	name: string;
	url: string;

	visible: boolean;
	highlight: string;

	password: boolean;

	date: Date;
	views: number;
}

export default async function handler(server: Server, req: DashboardRequest, res: Response) {
	const { search: _search, page: _page, sort: _sort } = req.query;
	const page = isNaN(Number(_page)) ? 0 : Number(_page);
	const searchQ = (Array.isArray(_search) ? _search[0] : _search ?? "") as string;
	const sort = BinSort[Number(_sort)] ? Number(_sort) : BinSort.DATE_NEW_OLD;

	let entries = await server.prisma.pastebin.findMany({ where: { domain: req.locals.domain.domain } });
	if (searchQ.length) {
		const search = new Fuse(entries, {
			keys: ["name", "views", "highlight"],
			isCaseSensitive: false
		});
		entries = search.search(searchQ).map((sr) => sr.item);
	}

	const sorted = Utils.binSort(entries, sort);
	const chunks = Utils.chunk(sorted, 50);
	const chunk = (page > chunks.length ? chunks[chunks.length - 1] : chunks[page]) ?? [];

	const mapped = chunk.map<ApiBin>((bin) => ({
		name: bin.id,
		date: bin.date,
		password: Boolean(bin.password),
		highlight: bin.highlight,
		views: bin.views,
		visible: bin.visible,
		url: `${Utils.getProtocol()}${req.locals.domain}/bins/${bin.id}`
	}));

	res.send({
		pages: chunks.length,
		entries: mapped
	});
}

export const methods: RequestMethods[] = ["get"];
export const middleware: Middleware[] = [Auth.userMiddleware.bind(Auth)];

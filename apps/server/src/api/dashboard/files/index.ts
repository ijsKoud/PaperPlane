import type { Response } from "express";
import Fuse from "fuse.js";
import { lookup } from "mime-types";
import { Auth } from "../../../lib/Auth.js";
import { type DashboardRequest, FilesSort, type Middleware, type RequestMethods } from "../../../lib/types.js";
import { Utils } from "../../../lib/utils.js";
import type Server from "../../../Server.js";

interface ApiFile {
	name: string;
	url: string;

	visible: boolean;
	size: string;
	isImage: boolean;
	ext: string;

	password: boolean;

	date: Date;
	views: number;
}

export default async function handler(server: Server, req: DashboardRequest, res: Response) {
	const { search: _search, page: _page, sort: _sort } = req.query;
	const page = isNaN(Number(_page)) ? 0 : Number(_page);
	const searchQ = (Array.isArray(_search) ? _search[0] : _search ?? "") as string;
	const sort = FilesSort[Number(_sort)] ? Number(_sort) : FilesSort.DATE_NEW_OLD;

	let entries = await server.prisma.file.findMany({ where: { domain: req.locals.domain.domain } });
	if (searchQ.length) {
		const search = new Fuse(entries, {
			keys: ["id", "size", "views"],
			isCaseSensitive: false
		});
		entries = search.search(searchQ).map((sr) => sr.item);
	}

	const sorted = Utils.filesSort(entries, sort);
	const chunks = Utils.chunk(sorted, 50);
	const chunk = (page > chunks.length ? chunks[chunks.length - 1] : chunks[page]) ?? [];

	const mapped = chunk.map<ApiFile>((file) => ({
		name: file.id,
		date: file.date,
		isImage: (file.mimeType || lookup(file.path) || "").includes("image"),
		password: Boolean(file.password),
		size: file.size,
		views: file.views,
		visible: file.visible,
		ext: Utils.getExtension(file.mimeType || lookup(file.path) || "") || "",
		url: `${Utils.getProtocol()}${req.locals.domain}/files/${file.id}`
	}));

	res.send({
		pages: chunks.length,
		entries: mapped
	});
}

export const methods: RequestMethods[] = ["get"];
export const middleware: Middleware[] = [Auth.userMiddleware.bind(Auth)];

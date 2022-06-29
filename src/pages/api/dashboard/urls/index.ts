import Fuse from "fuse.js";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";
import type { ApiURL } from "../../../../lib/types";
import { chunk, getUser, parseQuery, sortLinksArray } from "../../../../lib/utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const user = await getUser(req);
	if (!user) return res.status(401).send({ message: "You need to be logged in to view this content." });

	const page = Number(parseQuery(req.query.page ?? 1));
	const sortType = parseQuery(req.query.sort ?? "default");
	const searchQ = parseQuery(req.query.search ?? "");

	const dbUrls = await prisma.url.findMany();
	const urls = dbUrls.map<ApiURL>((url) => {
		return {
			date: url.date,
			name: url.id,
			redirect: url.url,
			url: `${req.headers.host}/r/${url.id}`,
			pinned: url.pinned,
			visible: url.visible,
			visits: url.visits
		};
	});

	let apiRes: ApiURL[] = urls;
	if (searchQ) {
		const search = new Fuse(urls, { keys: ["name", "url"], isCaseSensitive: false });
		apiRes = search.search(searchQ).map((sr) => sr.item);
	}

	const sortedArr = sortLinksArray(apiRes, sortType);
	const chunks = chunk(sortedArr, 25);
	res.send({ files: chunks[isNaN(page) ? 0 : page - 1] ?? [], pages: chunks.length });
}

import Fuse from "fuse.js";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";
import type { ApiFile } from "../../../../lib/types";
import { chunk, formatBytes, getFileExt, getUser, parseQuery, sortFilesArray } from "../../../../lib/utils";
import { lookup } from "mime-types";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const user = await getUser(req);
	if (!user) return res.status(401).send({ message: "You need to be logged in to view this content." });

	const page = Number(parseQuery(req.query.page ?? 1));
	const sortType = parseQuery(req.query.sort ?? "default");
	const searchQ = parseQuery(req.query.search ?? "");

	const dbFiles = await prisma.file.findMany();
	const files = dbFiles.map<ApiFile>((f) => {
		const fileName = f.path.split("/").reverse()[0];
		const fileExt = getFileExt(fileName);
		const fileId = f.id;

		const hiddenChar = ["\u200B", "\u2060", "\u200C", "\u200D"];
		const invisId = hiddenChar.some((char) => fileId.includes(char));

		const apiFileName = `${fileId}${invisId ? "" : fileExt}`;

		return {
			name: apiFileName,
			size: formatBytes(Number(f.size)),
			_size: f.size,
			date: f.date,
			views: f.views,
			isImage: (lookup(`name${fileExt}`) || "").includes("image"),
			pwdProtection: Boolean(f.password),
			visible: f.visible,
			url: `${req.headers.host}/files/${apiFileName}`
		};
	});

	let apiRes: ApiFile[] = files;
	if (searchQ) {
		const search = new Fuse(files, { keys: ["name"], isCaseSensitive: false });
		apiRes = search.search(searchQ).map((sr) => sr.item);
	}

	// @ts-ignore prop is there but not in types
	const sortedArr = sortFilesArray(apiRes, sortType);
	const chunks = chunk(sortedArr, 25);
	res.send({ files: chunks[isNaN(page) ? 0 : page - 1] ?? [], pages: chunks.length });
}

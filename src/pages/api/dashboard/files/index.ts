import Fuse from "fuse.js";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";
import type { ApiFile } from "../../../../lib/types";
import { getFileExt, getUser, parseQuery, sortFilesArray } from "../../../../lib/utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const user = await getUser(req);
	if (!user) return res.status(401).send({ message: "You need to be logged in to view this content." });

	const sortType = parseQuery(req.query.sortType ?? "default");
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
			size: f.size,
			date: f.date,
			pinned: f.pinned,
			views: f.views,
			pwdProtection: Boolean(f.password),
			url: `${req.headers.host}/files/${apiFileName}`
		};
	});

	let apiRes: ApiFile[] = files;
	if (searchQ) {
		const search = new Fuse(files, { keys: ["name"], isCaseSensitive: false });
		apiRes = search.search(searchQ).map((sr) => sr.item);
	}

	res.send(sortFilesArray(apiRes, sortType));
}

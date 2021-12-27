import prisma from "../../../lib/prisma";
import { readdir } from "fs/promises";
import type { NextApiRequest, NextApiResponse } from "next";
import { FILE_DATA_DIR, Stats } from "../../../lib";
import { formatBytes, getUser, sizeOfDir } from "../../../lib/utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse<Stats | null>) {
	const user = await getUser(req);
	if (!user) return res.status(401).send(null);

	const rawBytes = await sizeOfDir(FILE_DATA_DIR);
	const bytes = formatBytes(rawBytes);

	const files = await readdir(FILE_DATA_DIR);
	const links = await prisma.url.findMany();

	res.json({
		files: {
			bytes,
			size: files.length
		},
		links: links.length
	});
}

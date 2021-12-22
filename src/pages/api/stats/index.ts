import prisma from "../../../lib/prisma";
import { readdir } from "fs/promises";
import type { NextApiRequest, NextApiResponse } from "next";
import { DATA_DIR, FILE_DATA_DIR, Stats } from "../../../lib";
import { formatBytes, sizeOfDir } from "../../../lib/utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse<Stats>) {
	const rawBytes = await sizeOfDir(DATA_DIR);
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

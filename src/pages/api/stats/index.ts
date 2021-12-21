import { PrismaClient } from "@prisma/client";
import { readdir } from "fs/promises";
import type { NextApiRequest, NextApiResponse } from "next";
import { DATA_DIR, Stats } from "../../../lib";
import { formatBytes, sizeOfDir } from "../../../lib/utils";

const client = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse<Stats>) {
	const rawBytes = await sizeOfDir(DATA_DIR);
	const bytes = formatBytes(rawBytes);

	const files = await readdir(DATA_DIR);
	const links = await client.url.findMany();

	res.json({
		files: {
			bytes,
			size: files.length
		},
		links: links.length
	});
}

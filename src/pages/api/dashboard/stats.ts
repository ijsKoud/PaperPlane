import type { NextApiRequest, NextApiResponse } from "next";
import { formatBytes, getUser } from "../../../lib/utils";
import prisma from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const user = await getUser(req);
	if (!user) return res.status(401).send({ message: "You need to be logged in to view this content." });

	const files = await prisma.file.findMany();
	const links = await prisma.url.findMany();
	const size = files
		.map((f) => f.size)
		.map((size) => Number(size))
		.reduce((a, b) => a + b, 0);

	res.json({
		files: {
			bytes: formatBytes(size),
			size: files.length
		},
		links: links.length
	});
}

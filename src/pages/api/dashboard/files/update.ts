import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";
import { getUser } from "../../../../lib/utils";
import { unlink } from "fs/promises";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const user = await getUser(req);
	if (!user) return res.status(401).send({ message: "You need to be logged in to view this content." });

	if (req.method === "DELETE") {
		const { id } = req.body;
		if (!id) return res.status(400).send({ message: "No fileId provided." });

		if (Array.isArray(id)) {
			const files = await prisma.file.findMany({ where: { id: { in: id } } });
			if (!files) return res.status(404).send({ message: "No files found on the server." });

			try {
				await Promise.all(files.map((file) => unlink(file.path).catch(() => void 0)));
			} catch (err) {}

			return res.status(204).send(undefined);
		} else if (typeof id === "string") {
			const file = await prisma.file.findFirst({ where: { id: id.split(".")[0] } });
			if (!file) return res.status(404).send({ message: "File was not found on the server." });

			try {
				await unlink(file.path);
			} catch (err) {}

			return res.status(204).send(undefined);
		}
	}

	res.status(403).send({ message: "Forbidden method" });
}

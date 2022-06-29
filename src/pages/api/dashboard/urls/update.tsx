import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";
import { getUser } from "../../../../lib/utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const user = await getUser(req);
	if (!user) return res.status(401).send({ message: "You need to be logged in to view this content." });

	if (req.method === "DELETE") {
		const { id } = req.body;
		if (!id) return res.status(400).send({ message: "No urlId provided." });

		if (Array.isArray(id)) {
			const urls = await prisma.url.findMany({ where: { id: { in: id } } });
			if (!urls) return res.status(404).send({ message: "No urls found on the server." });

			try {
				await prisma.url.deleteMany({ where: { id: { in: urls.map((url) => url.id) } } });
			} catch (err) {}

			return res.status(204).send(undefined);
		} else if (typeof id === "string") {
			const url = await prisma.url.findFirst({ where: { id: id.split(".")[0] } });
			if (!url) return res.status(404).send({ message: "URL was not found on the server." });

			try {
				await prisma.url.delete({ where: url });
			} catch (err) {}

			return res.status(204).send(undefined);
		}
	} else if (req.method === "POST") {
		const { name, newName, visible } = req.body;
		if (typeof name !== "string" || typeof newName !== "string" || typeof visible !== "boolean")
			return res.status(400).send({ message: "Invalid body provided." });

		const url = await prisma.url.findFirst({ where: { id: name } });
		if (!url) return res.status(404).send({ message: "No url found on the server." });

		try {
			const id = newName || name;
			await prisma.url.update({ where: { id: name }, data: { id, visible } });

			res.status(204).send(undefined);
		} catch (err) {
			console.error(err);
			res.status(500).send({ message: "Internal error, please try again later." });
		}
	}

	res.status(403).send({ message: "Forbidden method" });
}

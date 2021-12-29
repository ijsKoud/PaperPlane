import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import { getUser } from "../../../lib/utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const user = await getUser(req);
	if (!user) return res.status(401).send(null);

	if (req.method === "DELETE") {
		if (!req.body) return res.status(400).send({ message: "Missing name in request body" });

		const { path } = req.body;
		if (typeof path !== "string" || !path.length) return res.status(400).send({ message: "path is not a valid string" });

		const url = await prisma.url.findFirst({ where: { id: path } });
		if (!url) return res.status(404).send({ message: "The requested shorturl was not found" });

		try {
			await prisma.url.delete({ where: { id: url.id } });
			res.status(204).send(null);
		} catch (err) {
			console.error(err);
			res.status(500).json({ message: "Something went wrong on our side, please try again later." });
		}

		return;
	} else if (req.method === "PATCH") {
		if (!req.body) return res.status(400).send({ message: "Missing name in request body" });

		const { newData, oldPath } = req.body;
		if (typeof oldPath !== "string" || !oldPath.length) return res.status(400).send({ message: "oldPath is not a valid string" });
		if (typeof newData !== "object") return res.status(400).send({ message: "newData is not a valid object" });
		if (typeof newData.url !== "string" || typeof newData.id !== "string")
			return res.status(400).send({ message: "Invalid data for newData provided (missing id or url)" });
		if (!newData.url.startsWith("http")) return res.status(400).send({ message: "Invalid url provided" });
		if (!newData.url.includes("/")) return res.status(400).send({ message: "Invalid path provided" });

		const url = await prisma.url.findFirst({ where: { id: oldPath } });
		if (!url) return res.status(404).json({ message: "The requested shorturl was not found" });

		url.id = newData.id;
		url.url = newData.url;

		try {
			await prisma.url.update({ where: { id: oldPath }, data: url });
			res.status(204).send(null);
		} catch (err) {
			res.status(500).json({ message: "Something went wrong on our side, please try again later." });
		}

		return;
	}

	res.status(403).json({ message: "Method forbidden on this route" });
}

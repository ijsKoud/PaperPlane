import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

const client = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method === "DELETE") {
		if (!req.body) return res.status(400).send({ message: "Missing name in request body" });

		const { path } = req.body;
		if (typeof path !== "string" || !path.length) return res.status(400).send({ message: "path is not a valid string" });

		const url = await client.url.findFirst({ where: { id: path } });
		if (!url) return res.status(404).send({ message: "The requested shorturl was not found" });

		try {
			await client.url.delete({ where: url });
			res.status(204).send(null);
		} catch (err) {
			res.status(500).json({ message: "Something went wrong on our side, please try again later." });
		}

		return;
	} else if (req.method === "PATCH") {
		if (!req.body) return res.status(400).send({ message: "Missing name in request body" });

		const { newData, oldPath } = req.body;
		if (typeof oldPath !== "string" || !oldPath.length) return res.status(400).send({ message: "oldPath is not a valid string" });
		if (typeof newData !== "object") return res.status(400).send({ message: "newData is not a valid object" });
		if (typeof newData.url !== "string" || typeof newData.path !== "string")
			return res.status(400).send({ message: "Invalid data for newData provided (missing path or url)" });
		if (!newData.url.startsWith("http")) return res.status(400).send({ message: "Invalid url provided" });
		if (!newData.url.includes("/")) return res.status(400).send({ message: "Invalid path provided" });

		const url = await client.url.findFirst({ where: { id: oldPath } });
		if (!url) return res.status(404).json({ message: "The requested shorturl was not found" });

		url.id = newData.path;
		url.url = newData.url;

		try {
			await client.url.update({ where: { id: oldPath }, data: url });
			res.status(204).send(null);
		} catch (err) {
			res.status(500).json({ message: "Something went wrong on our side, please try again later." });
		}

		return;
	}

	res.status(403).json({ message: "Method forbidden on this route" });
}

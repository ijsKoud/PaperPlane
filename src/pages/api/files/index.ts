import { unlink } from "fs/promises";
import type { NextApiRequest, NextApiResponse } from "next";
import { join } from "path";
import { FILE_DATA_DIR } from "../../../lib";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method === "DELETE") {
		if (!req.body) return res.status(400).send({ message: "Missing name in request body" });

		const { name } = req.body;
		if (typeof name !== "string" || !name.length) return res.status(400).send({ message: "Name is not a valid string" });

		const path = join(FILE_DATA_DIR, name);
		if (!path.startsWith(FILE_DATA_DIR)) return res.status(403).send({ message: "Forbidden" });

		try {
			await unlink(path);
			res.status(204).send(null);
		} catch (err) {
			res.status(500).json({ message: "Something went wrong on our side, please try again later." });
		}

		return;
	}

	res.status(403).json({ message: "Method forbidden on this route" });
}

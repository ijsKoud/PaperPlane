import { rename, unlink } from "fs/promises";
import type { NextApiRequest, NextApiResponse } from "next";
import { join } from "path";
import { FILE_DATA_DIR } from "../../../lib";
import { getUser } from "../../../lib/utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const user = await getUser(req);
	if (!user) return res.status(401).send(null);

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
	} else if (req.method === "PATCH") {
		if (!req.body) return res.status(400).send({ message: "Missing name in request body" });

		const { oldName, newName } = req.body;
		if (typeof oldName !== "string" || !oldName.length) return res.status(400).send({ message: "oldName is not a valid string" });
		if (typeof newName !== "string" || !newName.length) return res.status(400).send({ message: "newName is not a valid string" });

		const path = join(FILE_DATA_DIR, oldName);
		if (!path.startsWith(FILE_DATA_DIR)) return res.status(403).send({ message: "Forbidden" });

		const newPath = join(FILE_DATA_DIR, newName);
		if (!newPath.startsWith(FILE_DATA_DIR)) return res.status(403).send({ message: "Forbidden" });

		try {
			await rename(path, newPath);
			res.status(204).send(null);
		} catch (err) {
			res.status(500).json({ message: "Something went wrong on our side, please try again later." });
		}

		return;
	}

	res.status(403).json({ message: "Method forbidden on this route" });
}

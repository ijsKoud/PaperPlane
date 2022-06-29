import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";
import { encryptPassword, getUser } from "../../../../lib/utils";
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
	} else if (req.method === "POST") {
		const { name, newName, password } = req.body;
		if (typeof name !== "string" || typeof newName !== "string" || typeof password !== "string")
			return res.status(400).send({ message: "Invalid body provided." });

		const id = name.split(".")[0];
		const file = await prisma.file.findFirst({ where: { id } });
		if (!file) return res.status(404).send({ message: "No file found on the server." });

		try {
			const pswd = password.length ? encryptPassword(password) : null;
			const n = newName.split(".")[0] || id;
			await prisma.file.update({ where: { id }, data: { id: n, password: pswd } });

			res.status(204).send(undefined);
		} catch (err) {
			console.error(err);
			res.status(500).send({ message: "Internal error, please try again later." });
		}
	}

	res.status(403).send({ message: "Forbidden method" });
}

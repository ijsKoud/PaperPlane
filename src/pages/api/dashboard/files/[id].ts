import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";
import { decryptToken, encryptToken, formatBytes } from "../../../../lib/utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const id = req.query.id as string;
	const fileId = id.split(".")[0];

	const file = await prisma.file.findFirst({ where: { id: fileId } });
	if (!file) return res.status(404).send({ message: "File not found on server." });

	if (req.method === "GET")
		return res.send({
			size: formatBytes(Number(file.size)),
			name: file.id,
			date: file.date
		});
	else if (req.method === "POST") {
		if (!file.password) return res.status(403).send({ message: "File does not have a password." });

		const [filePassword] = decryptToken(file.password).split(".");
		if (filePassword === req.body.password) {
			const token = encryptToken(`${filePassword}.${Date.now()}`);
			return res.status(200).send({ token });
		}

		return res.status(400).send({ message: "Incorrect password provided." });
	}

	res.status(403).send({ message: "Forbidden method used." });
}

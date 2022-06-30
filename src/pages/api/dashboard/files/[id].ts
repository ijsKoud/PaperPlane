import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";
import { decryptToken, encryptToken, formatBytes } from "../../../../lib/utils";
import { serialize } from "cookie";

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
			res.setHeader("Set-Cookie", serialize(fileId, token, { maxAge: 6048e5 }));

			return res.status(204).send(undefined);
		}

		return res.send({ message: "Incorrect password provided." });
	}

	res.status(403).send({ message: "Forbidden method used." });
}

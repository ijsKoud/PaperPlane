import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

const client = new PrismaClient();

interface ReqBody {
	username: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== "POST") return res.status(403).json({ error: "Invalid method used" });
	if (typeof req.body.username !== "string") return res.status(400).json({ error: "Missing password or username in the request body" });

	const body = req.body as ReqBody;
	const user = await client.user.findFirst({ where: { username: body.username } });
	if (!user?.twoAuthToken) return res.status(200).send({ enabled: false });

	res.status(200).send({ enabled: true });
}

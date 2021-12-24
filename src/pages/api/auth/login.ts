import prisma from "../../../lib/prisma";
import { scryptSync, timingSafeEqual } from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";
import { encryptToken } from "../../../lib/utils";

interface ReqBody {
	password: string;
	username: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== "POST") return res.status(403).json({ error: "Invalid method used" });
	if (typeof req.body.password !== "string" || typeof req.body.username !== "string")
		return res.status(400).json({ message: "Missing password or username in the request body" });

	const body = req.body as ReqBody;
	const user = await prisma.user.findFirst({ where: { username: body.username } });
	if (!user) return res.status(404).send({ message: "Incorrect username or password provided" });

	const [salt, key] = user.password.split(":");
	const passwordBuffer = scryptSync(body.password, salt, 64);

	const keyBuffer = Buffer.from(key, "hex");
	const match = timingSafeEqual(passwordBuffer, keyBuffer);
	if (!match) return res.status(404).send({ message: "Incorrect username or password provided" });

	const token = encryptToken(`${user.username}.${Date.now()}`);
	res.status(200).json({ token });
}

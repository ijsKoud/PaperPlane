import type { NextApiRequest, NextApiResponse } from "next";
import { encryptPassword, getUser, encryptToken } from "../../../lib/utils";
import prisma from "../../../lib/prisma";
import type { CleanUser } from "../../../lib/types";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method === "GET") {
		const user = await getUser(req);
		if (!user) return res.status(200).send(null);

		const cleanUser = { ...user } as CleanUser & { password?: string };
		delete cleanUser.password;

		return res.status(200).json(cleanUser);
	} else if (req.method === "PATCH") {
		const body = req.body as { password?: string; username?: string };
		if (typeof body.password !== "string" && typeof body.username !== "string")
			return res.status(400).json({ message: "Password/username/theme missing in request body" });

		const user = await getUser(req);
		if (!user) return res.status(401).json({ message: "You need to be logged in to perform this action" });

		if (body.password) {
			const password = encryptPassword(body.password);
			const token = encryptToken(`${user.username}.${Date.now()}`);

			user.password = password;
			await prisma.user.update({ where: { username: user.username }, data: user });

			return res.json({ token });
		} else if (body.username) {
			const token = encryptToken(`${body.username}.${Date.now()}`);

			await prisma.user.update({ where: { username: user.username }, data: { username: body.username } });

			return res.json({ token });
		}
	}

	res.status(403).json({ error: "Forbidden method" });
}

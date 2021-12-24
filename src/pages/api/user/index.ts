import type { NextApiRequest, NextApiResponse } from "next";
import { encryptPassword, getUser, createToken } from "../../../lib/utils";
import prisma from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method === "GET") {
		const user = await getUser(req);
		if (!user) return res.status(200).send(null);

		return res.status(200).json({
			...user,
			twoAuthToken: null,
			password: ""
		});
	} else if (req.method === "PATCH") {
		const body = req.body as { password?: string; username?: string };
		if (typeof body.password !== "string" && typeof body.username !== "string")
			return res.status(400).json({ message: "Password/username missing in request body" });

		const user = await getUser(req);
		if (!user) return res.status(401).json({ message: "You need to be logged in to perform this action" });

		if (body.password) {
			const password = encryptPassword(body.password);
			const token = createToken();

			user.password = password;
			await prisma.user.update({ where: { username: user.username }, data: user });

			return res.json({ token });
		} else if (body.username) {
			const token = createToken();

			user.username = body.username;
			await prisma.user.update({ where: { username: user.username }, data: user });

			return res.json({ token });
		}
	}

	res.status(403).json({ error: "Forbidden method" });
}

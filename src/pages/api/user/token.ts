import type { NextApiRequest, NextApiResponse } from "next";
import { getUser, createToken } from "../../../lib/utils";
import prisma from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method === "POST") {
		const user = await getUser(req);
		if (!user) return res.status(401).json({ message: "You need to be logged in to perform this action" });

		user.token = createToken();
		await prisma.user.update({ where: { username: user.username }, data: user });
		return res.status(204).send(null);
	}

	res.status(403).json({ error: "Forbidden method" });
}

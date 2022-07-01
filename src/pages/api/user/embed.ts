import type { NextApiRequest, NextApiResponse } from "next";
import { getUser } from "../../../lib/utils";
import prisma from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method === "PATCH") {
		const body = req.body as { embedColour: string; embedTitle: string; embedDescription: string; embedEnabled: boolean };
		if (
			(!body.embedColour || typeof body.embedColour !== "string") &&
			(!body.embedTitle || typeof body.embedTitle !== "string") &&
			(!body.embedDescription || typeof body.embedDescription !== "string") &&
			typeof body.embedEnabled !== "boolean"
		)
			return res.status(400).json({ message: "embedColour/embedTitle/embedDescription/embedEnabled missing in request body" });

		let user = await getUser(req);
		if (!user) return res.status(401).json({ message: "You need to be logged in to perform this action" });

		user = { ...user, ...body };
		await prisma.user.update({ where: { username: user.username }, data: user });
		return res.status(204).send(null);
	}

	res.status(403).json({ error: "Forbidden method" });
}

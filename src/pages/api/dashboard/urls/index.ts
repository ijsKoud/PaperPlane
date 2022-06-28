import type { NextApiRequest, NextApiResponse } from "next";
import { getUser } from "../../../../lib/utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const user = await getUser(req);
	if (!user) return res.status(401).send({ message: "You need to be logged in to view this content." });
}

import type { User } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { getUser } from "../../../lib/utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse<User | null>) {
	const user = await getUser(req);
	if (!user) return res.status(200).send(null);

	res.status(200).json({
		...user,
		twoAuthToken: null,
		password: ""
	});
}

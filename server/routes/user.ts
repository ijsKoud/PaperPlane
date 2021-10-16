import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { encrypt } from "../utils";

const client = new PrismaClient();
const router = Router();

router.get("/", async (req, res) => {
	const { session } = req.cookies;
	if (!session) return res.send(null);

	const sessionData = await client.session.findFirst({
		where: { token: session },
		include: { user: true },
	});

	const user = sessionData?.user;
	if (!user) return res.send(null);

	res.send({ ...user, password: "" });
});

router.put("/update", async (req, res) => {
	const { session } = req.cookies;
	const { username, password } = req.body;
	if (!session || (!username && !password))
		return res.status(400).send({
			message: "Something went wrong while processing your request, please try again later",
			error: "Bad Request",
		});

	const user = await client.session.findFirst({
		where: { token: session },
		include: { user: true },
	});

	if (!user)
		return res
			.status(401)
			.send({ message: "You need to be logged in to perform this action", error: "Unauthorized" });

	if (password) user.user.password = await encrypt(password);
	if (username) user.user.username = username.slice(0, 32);

	await client.user.update({ where: { userId: user.userId }, data: user.user });
	res.sendStatus(204);
});

export default router;

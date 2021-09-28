import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { v4 as uuid } from "uuid";
import { verify } from "../utils";

const client = new PrismaClient();
const router = Router();

router.post("/login", async (req, res) => {
	const { password, username } = req.body;
	if (!password || !username)
		return res.status(400).send({
			message: "Something went wrong, please try again later",
			error: "Invalid request, missing 'password' and/or 'username' in body",
		});

	const user = await client.user.findFirst({
		where: { username: username },
		select: { userId: true, password: true },
	});

	if (!user)
		return res.status(404).send({
			message: "No user was found with the provided credentials",
			error: "User not found",
		});

	const valid = await verify(password, user.password);
	if (!valid)
		return res.status(401).send({
			message: "The password or username is incorrect",
			error: "Incorrect credentials provided",
		});

	const id = uuid();
	const session = await client.session.create({ data: { token: id, userId: user.userId } });
	return res.send({ sessionId: session.token });
});

router.delete("/logout", async (req, res) => {
	const { session } = req.cookies;
	if (!session)
		return res.status(401).send({
			message: "You aren't logged in, you cannot perform this action",
			error: "User is not authorized",
		});

	await client.session.delete({ where: { token: session } });
	res.sendStatus(204);
});

export default router;

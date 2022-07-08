import { scryptSync, timingSafeEqual } from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";
import { encryptToken } from "../../../lib/utils";
import prisma from "../../../lib/prisma";
import { object, string, ValidationError } from "yup";

interface ReqBody {
	password: string;
	username: string;
}

const validation = object({
	password: string().required("Password is a required field").min(5, "Password must be 5 characters or longer"),
	username: string().max(32).required("Username is a required field").min(5, "Username must not be longer than 32 characters")
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== "POST") return res.status(403).json({ error: "Invalid method used" });

	let message = "";
	await validation.validate(req.body, { abortEarly: false }).catch((err: ValidationError) => {
		message = err.errors.join("; ");
	});
	if (message) return res.status(400).send({ message });

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

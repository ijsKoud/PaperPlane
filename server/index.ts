import express from "express";
import { PrismaClient } from ".prisma/client";
import cors from "cors";
import cookieParser from "cookie-parser";
import { json } from "body-parser";
import { v4 as uuid } from "uuid";

import routers from "./routes";
import { nanoid } from "nanoid";
import { encrypt } from "./utils";

const client = new PrismaClient();
const server = express();

server
	.use(cors({ credentials: true, origin: ["http://localhost:3000"] }))
	.use(cookieParser())
	.use(json())
	.use(routers);

(async () => {
	await new Promise((res) => client.$connect().then(() => res(true)));

	// await client.user.deleteMany();
	const users = await client.user.findMany();
	if (users.length === 0) {
		const user = await client.user.create({
			data: {
				username: "default",
				userId: nanoid(8),
				token: uuid(),
				password: await encrypt("password"),
			},
		});

		console.log(`Default user created:\nusername: ${user.username}\npassword: "password"`);
	}

	server.listen(3001, () => console.log("Online"));
})();

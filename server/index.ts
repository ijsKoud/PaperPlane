import express from "express";
import { PrismaClient } from ".prisma/client";
import cors from "cors";
import cookieParser from "cookie-parser";
import { json } from "body-parser";
import { createUser } from "./utils";

import routers from "./routes";

const client = new PrismaClient();
const server = express();

server
	.use(cors({ credentials: true, origin: ["http://localhost:3000"] }))
	.use(cookieParser())
	.use(json())
	.use(routers);

(async () => {
	await new Promise((res) => client.$connect().then(() => res(true)));

	// await client.session.deleteMany();
	// await client.user.deleteMany();
	const users = await client.user.findMany();
	if (users.length === 0) {
		const user = await createUser("default", "password");
		console.log(`Default user created:\nusername: ${user.username}\npassword: "password"`);
	}

	server.listen(3001, () => console.log("Online"));
})();

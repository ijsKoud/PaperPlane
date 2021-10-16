/* eslint-disable no-useless-escape */
import express from "express";
import { PrismaClient } from ".prisma/client";
import cors from "cors";
import cookieParser from "cookie-parser";
import { json } from "body-parser";
import { createUser } from "./utils";

import routers from "./routes";
import logger from "./logger";
import getSettings from "../settings";
import next from "next";
import { parse } from "url";

const client = new PrismaClient({
	log: [
		{
			emit: "event",
			level: "error",
		},
		{
			emit: "event",
			level: "warn",
		},
	],
});
const server = express();

server
	.use(cors({ credentials: true, origin: ["http://localhost:3000"] }))
	.use(cookieParser())
	.use(json())
	.use(routers);

const dbConnect = async () => {
	const log = logger("database");
	log.info("Connecting to database...");

	await client
		.$connect()
		.then(() => log.info("Successfully connected to database"))
		.catch((err) => log.fatal("Failed to connect to database", err));

	client.$on("warn", (event) => log.warn(event));
	client.$on("error", (event) => log.error(event));
};

const userCheck = async () => {
	const log = logger("database");

	log.debug("Checking user list...");
	const users = await client.user.findMany();
	if (users.length === 0) {
		log.debug("No users found, creating default user...");

		const user = await createUser("default", "password");
		log.info(
			`Default user created:\nusername: ${user.username}\npassword: "password"`,
			"please change the password and username immediately!"
		);
	}

	log.debug(`${users.length} user(s) found`);
};

const sessionHandler = async () => {
	const log = logger("sessions");
	log.info("Starting session collector...");

	const checkSessions = async () => {
		log.info("Running session collector...");
		const sessions = await client.session.findMany();
		const filtered = sessions
			.filter((session) => session.created.getTime() + 12096e5 <= Date.now())
			.map((session) => session.token);

		log.debug(
			`Found ${sessions.length} sessions from which ${filtered.length} are awaiting deletion`
		);
		const deleted = await client.session.deleteMany({
			where: {
				token: {
					in: filtered,
				},
			},
		});

		log.info(`From the ${sessions.length} sessions ${deleted.count} were deleted`);
	};

	setTimeout(checkSessions, 6e5);
	log.info("Session collector is now collection sessions that are awaiting deletion");

	await checkSessions();
};

(async () => {
	console.log(
		[
			"______                         ______  _                     ",
			"| ___ \\                        | ___ \\| |                    ",
			"| |_/ /__ _  _ __    ___  _ __ | |_/ /| |  __ _  _ __    ___ ",
			"|  __// _` || '_ \\  / _ \\| '__||  __/ | | / _` || '_ \\  / _ \\",
			"| |  | (_| || |_) ||  __/| |   | |    | || (_| || | | ||  __/",
			"\\_|   \\__,_|| .__/  \\___||_|   \\_|    |_| \\__,_||_| |_| \\___|",
			"            | |                                              ",
			"            |_|                                              ",
		].join("\n")
	);

	await dbConnect();
	await userCheck();
	await sessionHandler();

	const nextApp = next({
		dev: process.env.NODE_ENV === "development",
		customServer: true,
	});

	await nextApp.prepare();
	const handler = nextApp.getRequestHandler();

	server.use((req, res) => {
		const parsedUrl = parse(req.url, true);
		handler(req, res, parsedUrl);
	});

	const settings = getSettings();
	server.listen(settings.port, () => logger("api").info(`Api listening to port ${settings.port}`));
})();

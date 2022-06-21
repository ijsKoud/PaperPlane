import next from "next";
import express, { Express } from "express";
import type { NextServer } from "next/dist/server/next";
import { version } from "../../package.json";
import { PrismaClient } from "@prisma/client";
import { Data, Routes, Logger } from "./components";
import { json, urlencoded } from "body-parser";
import { formatBytes, getConfig } from "./utils";

export class Server {
	public dev: boolean;
	public port: number;

	public express: Express;
	public next!: NextServer;

	public prisma: PrismaClient = new PrismaClient();

	public data: Data;
	public routes: Routes;

	public logger: Logger = new Logger(`${Date.now()}-v${version}-paperplane.log`, "SERVER");

	public constructor() {
		this.dev = Boolean(process.env.NODE_ENV === "development");
		this.express = express();
		this.port = getConfig().port;

		this.data = new Data(this);
		this.routes = new Routes(this);
	}

	public async run() {
		this.next = next({
			dev: this.dev,
			quiet: !this.dev,
			customServer: true
		});

		this.express.use(json(), urlencoded({ extended: true }));
		this.express.listen(this.port, () => this.startupLog());
		await this.prisma.$connect().then(() => this.logger.info("Prisma Database is up and running!"));

		await this.data.init();
		this.routes.init();

		await this.next.prepare();
		const handler = this.next.getRequestHandler();
		this.express.use((req, res) => handler(req, res));
	}

	private startupLog() {
		console.log(
			[
				"______                         ______  _                     ",
				"| ___ \\                        | ___ \\| |                    ",
				"| |_/ /__ _  _ __    ___  _ __ | |_/ /| |  __ _  _ __    ___ ",
				"|  __// _` || '_ \\  / _ \\| '__||  __/ | | / _` || '_ \\  / _ \\",
				"| |  | (_| || |_) ||  __/| |   | |    | || (_| || | | ||  __/",
				"\\_|   \\__,_|| .__/  \\___||_|   \\_|    |_| \\__,_||_| |_| \\___|",
				"            | |                                              ",
				"            |_|                                              "
			].join("\n")
		);
		this.logger.debug(`Starting Paperplane v${version} - NodeJS ${process.version}`);

		const config = getConfig();
		const configStr = [
			`Extensions: [${config.extensions.join(", ")}]`,
			`EncryptionKey: ${config.encryptionKey.length} characters long`,
			`Port: ${config.port}`,
			`Name Type: ${config.nameType}`,
			`Name Length: ${config.nameLength}`,
			`Max File Size: ${formatBytes(config.maxFileSize)}`,
			`Max Files Per Request: ${config.maxFilesPerRequest}`
		].join("\n");
		this.logger.debug(`The following configuration is used for this build:\n${configStr}`);

		this.logger.info(`Server is listening to port ${this.port}`);
	}
}

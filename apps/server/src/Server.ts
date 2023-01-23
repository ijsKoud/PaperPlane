import type { Server as HttpServer } from "node:http";
import type { NextServer } from "next/dist/server/next.js";
import express, { Express } from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { join } from "node:path";
import next from "next";
import { Config, Logger, Api } from "./lib/index.js";
import { LogLevel } from "@snowcrystals/icicle";
import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

export default class Server {
	public logger: Logger;
	public _config = new Config(this);
	public api = new Api(this);

	public prisma = new PrismaClient();

	public dev: boolean;
	public port: number;

	public _server!: HttpServer;
	public express: Express;
	public next!: NextServer;

	public get config() {
		const file = readFileSync(join(process.cwd(), "..", "..", "package.json"), "utf-8");
		const { version } = JSON.parse(file);

		return {
			port: Number(process.env.PORT) || 3e3,
			version
		};
	}

	public constructor() {
		this.dev = Boolean(process.env.NODE_ENV === "development");
		this.express = express();
		this.port = this.config.port;

		this.logger = new Logger({ level: this.dev ? LogLevel.Debug : LogLevel.Info });
	}

	public async run() {
		process.env.INSECURE_REQUESTS = (this.dev || process.env.INSECURE_REQUESTS === "true") as any;
		this.next = next.default({
			dev: this.dev,
			quiet: !this.dev,
			customServer: true,
			port: this.config.port,
			dir: join(process.cwd(), "..", "web")
		});

		this.express.use(cookieParser(), bodyParser.json(), bodyParser.urlencoded({ extended: true }));

		await this.api.start();
		await this._config.start();
		await this.next.prepare();

		const handler = this.next.getRequestHandler();
		this.express.use((req, res) => handler(req, res));

		await this.prisma.$connect().then(() => this.logger.info("[PRISMA]: Connected to data.db file in data directory."));
		this._server = this.express.listen(this.port, this.startupLog.bind(this));
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
		this.logger.debug(`Starting Paperplane v${this.config.version} - NodeJS ${process.version}`);
		this.logger.info(`Server is listening to port ${this.port}`);
	}
}

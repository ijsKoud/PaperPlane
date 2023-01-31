import type { Server as HttpServer } from "node:http";
import type { NextServer } from "next/dist/server/next.js";
import express, { Express } from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { join } from "node:path";
import next from "next";
import { Config, Logger, Api, Utils, AuditLog, Domains, Auth } from "./lib/index.js";
import { LogLevel } from "@snowcrystals/icicle";
import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";
import osUtils from "node-os-utils";
import pidusage from "pidusage";

export default class Server {
	public logger: Logger;
	public config = new Config(this);
	public api = new Api(this);
	public auth = new Auth();

	public prisma = new PrismaClient();
	public adminAuditLogs = new AuditLog(this, "admin");

	public domains = new Domains(this);

	public cpuUsage = 0;
	public storageUsage = 0;
	public memory = { usage: 0, total: 0 };

	public uptime = 0;
	public dev: boolean;

	public _server!: HttpServer;
	public express: Express;
	public next!: NextServer;

	public get envConfig() {
		const file = readFileSync(join(process.cwd(), "..", "..", "package.json"), "utf-8");
		const { version } = JSON.parse(file);

		return {
			...this.config.config,
			version: version as string
		};
	}

	public constructor() {
		this.dev = Boolean(process.env.NODE_ENV === "development");
		this.express = express();

		this.logger = new Logger({ level: this.dev ? LogLevel.Debug : LogLevel.Info });

		const updateUsage = async () => {
			const pid = await pidusage(process.pid);
			const memory = osUtils.mem.totalMem();

			this.memory = {
				total: memory,
				usage: pid.memory
			};

			this.uptime = pid.elapsed;

			const cpuUsage = await osUtils.cpu.usage();
			this.cpuUsage = cpuUsage;

			const storage = await Utils.sizeOfDir(join(process.cwd(), "..", "..", "data"));
			this.storageUsage = storage;
		};

		void updateUsage();
		setInterval(() => void updateUsage(), 6e4);
		setInterval(async () => {
			const pid = await pidusage(process.pid);
			this.uptime = pid.elapsed;
		}, 1e4);
	}

	public async run() {
		process.env.INSECURE_REQUESTS = (this.dev || this.envConfig.insecureRequests) as any;

		this.next = next.default({
			dev: this.dev,
			quiet: !this.dev,
			isNextDevCommand: true,
			customServer: true,
			port: this.envConfig.port,
			dir: join(process.cwd(), "..", "web")
		});

		this.express.use(cookieParser(), bodyParser.json(), bodyParser.urlencoded({ extended: true }));

		await this.api.start();
		await this.config.start();
		await this.adminAuditLogs.start();
		await this.domains.start();

		await this.next.prepare();
		const handler = this.next.getRequestHandler();
		this.express.use((req, res) => handler(req, res));

		await this.prisma.$connect().then(() => this.logger.info("[PRISMA]: Connected to data.db file in data directory."));
		this._server = this.express.listen(this.envConfig.port, this.startupLog.bind(this));
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
		this.logger.debug(`Starting Paperplane v${this.envConfig.version} - NodeJS ${process.version}`);
		this.logger.info(`Server is listening to port ${this.envConfig.port}`);
	}
}

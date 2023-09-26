import type { NextServer } from "next/dist/server/next.js";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { join } from "node:path";
import next from "next";
import { LogLevel } from "@snowcrystals/icicle";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import Config from "#lib/Config.js";
import { AuditLog } from "#components/AuditLog.js";
import ServerStats from "#lib/ServerStats.js";
import { Server as HighwayServer } from "@snowcrystals/highway";
import DomainsManager from "#lib/DomainsManager.js";
import Logger from "#lib/Logger.js";
import { fileURLToPath } from "node:url";
import { getTrpcMiddleware } from "#trpc/index.js";
import { Auth } from "#lib/Auth.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default class Server extends HighwayServer {
	public logger: Logger;
	public config = new Config(this);
	public auth = new Auth();
	public stats = new ServerStats();

	public prisma = new PrismaClient();
	public adminAuditLogs = new AuditLog(this, "admin");

	/** The domains manager */
	public domains = new DomainsManager(this);

	public dev: boolean;
	public next!: NextServer;

	public constructor() {
		super({ routePath: join(__dirname, "routes") });
		this.logger = new Logger({ level: LogLevel.Debug });
		this.dev = Boolean(process.env.NODE_ENV === "development");
	}

	public async run() {
		const config = Config.getEnv();
		process.env.INSECURE_REQUESTS = (this.dev || config.insecureRequests) as any;

		this.next = (next as any)({
			dev: this.dev,
			quiet: !this.dev,
			isNextDevCommand: true,
			customServer: true,
			port: config.port,
			dir: join(process.cwd(), "..", "web")
		});

		this.express.use(
			cors({ origin: "*", methods: ["GET", "DELETE", "POST", "PUT"] }),
			cookieParser(),
			bodyParser.json(),
			bodyParser.urlencoded({ extended: true })
		);

		await this.config.start();
		await this.domains.start();
		await this.adminAuditLogs.start();
		await this.next.prepare();

		this.express.use("/trpc", getTrpcMiddleware(this));
		const handler = this.next.getRequestHandler();

		await this.prisma.$connect().then(() => this.logger.info("[PRISMA]: Connected to data.db file in data directory."));
		await this.listen(config.port, this.startupLog.bind(this));

		this.express.use((req, res) => handler(req, res));
	}

	private startupLog() {
		const config = Config.getEnv();
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
		this.logger.debug(`Starting Paperplane v${Config.VERSION} - NodeJS ${process.version}`);
		this.logger.info(`Server is listening to port ${config.port}`);
	}
}

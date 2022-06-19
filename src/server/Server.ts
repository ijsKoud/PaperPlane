import next from "next";
import express, { Express } from "express";
import type { NextServer } from "next/dist/server/next";
import { version } from "../../package.json";
import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";

export class Server {
	public dev: boolean;
	public port: number;

	public express: Express;
	public next!: NextServer;

	public prisma: PrismaClient = new PrismaClient();

	public constructor() {
		this.dev = Boolean(process.env.NODE_ENV === "development");
		this.express = express();

		const getPort = () => {
			const env = process.env.PORT;
			if (!env) return 3e3;

			const port = Number(env);
			return isNaN(port) ? 3e3 : port;
		};
		this.port = getPort();
	}

	public async run() {
		this.next = next({
			dev: this.dev,
			quiet: !this.dev,
			customServer: true
		});

		this.express.listen(this.port, () => this.startupLog());
		await this.prisma.$connect().then(() => console.log("Prisma Database is up and running!"));

		await this.next.prepare();
		const handler = this.next.getRequestHandler();
		this.express.use((req, res) => handler(req, res));

		await this.initData();
	}

	private async initData() {
		const dir = join(process.cwd(), "data", "files");
		if (!existsSync(dir)) await mkdir(dir, { recursive: true }).catch(() => void 0);
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
		console.log(`Starting Paperplane v${version} - NodeJS ${process.version}`);
		console.log(`Server is listening to port ${this.port}`);
	}
}

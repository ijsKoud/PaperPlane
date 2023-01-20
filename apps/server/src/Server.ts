import type { Server as HttpServer } from "node:http";
import type { NextServer } from "next/dist/server/next.js";
import express, { Express } from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { join } from "node:path";
import next from "next";

export default class Server {
	public dev: boolean;
	public port: number;

	public _server!: HttpServer;
	public express: Express;
	public next!: NextServer;

	public get config() {
		return {
			port: Number(process.env.PORT) || 3e3
		};
	}

	public constructor() {
		this.dev = Boolean(process.env.NODE_ENV === "development");
		this.express = express();
		this.port = this.config.port;
	}

	public async run() {
		this.next = next.default({
			dev: this.dev,
			quiet: !this.dev,
			customServer: true,
			dir: join(process.cwd(), "..", "web")
		});

		this.express.use(cookieParser(), bodyParser.json(), bodyParser.urlencoded({ extended: true }));

		await this.next.prepare();
		const handler = this.next.getRequestHandler();
		this.express.use((req, res) => handler(req, res));

		this._server = this.express.listen(this.port, () => void 0);
	}
}

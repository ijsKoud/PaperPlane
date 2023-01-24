import { readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import type Server from "../Server.js";
import { fileURLToPath } from "node:url";
import type { ApiRoute, Middleware } from "./types.js";
import type { NextFunction, Request, Response } from "express";

const __dirname = dirname(fileURLToPath(import.meta.url));

export class Api {
	public constructor(public server: Server) {}

	public async start() {
		const files = this.readdirRecursive(join(__dirname, "..", "api")).filter((file) => file.endsWith(".js"));
		await Promise.all(files.map((filePath) => this.loadFile(filePath)));
	}

	private async loadFile(filePath: string) {
		const dirname = join(__dirname, "..", "api");
		const route = filePath.replace(dirname, "").replace(".js", "");

		const { default: handler, methods, middleware } = (await import(filePath)) as ApiRoute;
		methods.forEach((method) =>
			this.server.express[method](`/api${route}`, ...(middleware ?? []).map((m) => this.middlewareHandler(m)), (req, res, next) =>
				handler(this.server, req, res, next)
			)
		);
	}

	private middlewareHandler(middleware: Middleware) {
		return (req: Request, res: Response, next: NextFunction) => middleware(this.server, req, res, next);
	}

	private readdirRecursive(directory: string, results: string[] = []) {
		const files = readdirSync(directory);
		for (const file of files) {
			const filePath = join(directory, file);

			if (statSync(filePath).isDirectory()) results = this.readdirRecursive(filePath, results);
			else results.push(filePath);
		}

		return results;
	}
}

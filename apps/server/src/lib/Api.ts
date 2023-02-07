import { readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import type Server from "../Server.js";
import { fileURLToPath } from "node:url";
import type { ApiRoute, Middleware } from "./types.js";
import type { NextFunction, Request, Response } from "express";
import { charset, lookup } from "mime-types";
import { Auth } from "./Auth.js";
import rateLimit from "express-rate-limit";

const __dirname = dirname(fileURLToPath(import.meta.url));

export class Api {
	public constructor(public server: Server) {}

	public async start() {
		const files = this.readdirRecursive(join(__dirname, "..", "api")).filter((file) => file.endsWith(".js"));
		await Promise.all(files.map((filePath) => this.loadFile(filePath)));

		this.server.express.get("/files/:file", rateLimit({ max: 50, windowMs: 1e3 }), async (req, res) => {
			const { file: _fileName } = req.params;

			const domain = this.server.domains.get(req.headers.host || req.hostname);
			if (!domain) {
				await this.server.next.render404(req, res);
				return;
			}

			if (domain.disabled) {
				await this.server.next.render404(req, res);
				return;
			}

			const fileName = _fileName.includes(".") ? _fileName.split(".")[0] : _fileName;
			const file = await this.server.prisma.file.findFirst({ where: { domain: domain.domain, id: fileName } });

			const checkForAuth = () => {
				const authCookie: string = req.cookies["PAPERPLANE-AUTH"] ?? "";
				if (!authCookie.length) return false;

				const verify = Auth.verifyJWTToken(authCookie, this.server.envConfig.encryptionKey, domain.pathId);
				if (!verify) return false;

				return true;
			};

			if (!file || (!file.visible && !checkForAuth())) {
				await this.server.next.render404(req, res);
				return;
			}

			const checkForPassword = () => {
				const authCookie: string = req.cookies[`PAPERPLANE-${file.id}`] ?? "";
				if (!authCookie.length) return false;

				const verify = Auth.verifyJWTToken(authCookie, this.server.envConfig.encryptionKey, file.authSecret);
				if (!verify) return false;

				return true;
			};

			if (Boolean(file.password) && !checkForAuth() && !checkForPassword()) {
				res.redirect(`/files/${_fileName}/auth`);
				return;
			}

			if (!req.query.raw) {
				if (domain.embedEnabled || charset(lookup(file.path.split(/\//g).reverse()[0]) || "") === "UTF-8") {
					await this.server.next.render(req, res, `/files/${_fileName}`);
					return;
				}
			}

			res.sendFile(file.path, (err) => {
				if (err) {
					res.end();
					this.server.logger.error(err);
					return;
				}

				if (!req.query.preview) domain.addView(file.id);
			});
		});

		this.server.express.get("/r/:id", rateLimit({ max: 25, windowMs: 1e2 }), async (req, res) => {
			const { id: urlId } = req.params;

			const domain = this.server.domains.get(req.headers.host || req.hostname);
			if (!domain) {
				await this.server.next.render404(req, res);
				return;
			}

			if (domain.disabled) {
				await this.server.next.render404(req, res);
				return;
			}

			const url = await this.server.prisma.url.findFirst({ where: { domain: domain.domain, id: urlId } });

			const checkForAuth = () => {
				const authCookie: string = req.cookies["PAPERPLANE-AUTH"] ?? "";
				if (!authCookie.length) return false;

				const verify = Auth.verifyJWTToken(authCookie, this.server.envConfig.encryptionKey, domain.pathId);
				if (!verify) return false;

				return true;
			};

			if (!url || (!url.visible && !checkForAuth())) {
				await this.server.next.render404(req, res);
				return;
			}

			res.redirect(url.url);
			domain.addVisit(url.id);
		});
	}

	private async loadFile(filePath: string) {
		const dirname = join(__dirname, "..", "api");
		const route = filePath.replace(dirname, "").replace(".js", "");

		const { default: handler, methods, middleware } = (await import(filePath)) as ApiRoute;
		methods.forEach((method) => {
			const middlewareArray = (middleware ?? []).map((m) => this.middlewareHandler(m));

			const routePaths = route.split(/\//g);
			const endPath = routePaths.pop()!;
			const endRoute =
				endPath === "index" ? "" : endPath.startsWith("[") && endPath.endsWith("]") ? `:${endPath.slice(1, endPath.length - 1)}` : endPath;

			const correctRoute = [...routePaths, endRoute].join("/");
			this.server.express[method](
				`/api${correctRoute}`,
				rateLimit({
					windowMs: 2e3,
					max: 25
				}),
				...middlewareArray,
				(req, res, next) => handler(this.server, req, res, next)
			);
		});
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

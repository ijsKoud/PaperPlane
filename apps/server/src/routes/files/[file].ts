import Config from "#lib/Config.js";
import { Auth } from "#lib/index.js";
import type Server from "#server.js";
import { ApplyOptions, Route, methods } from "@snowcrystals/highway";
import type { Request, Response } from "express";
import { charset } from "mime-types";

@ApplyOptions<Route.Options>({ ratelimit: { max: 2e2, windowMs: 1e3 } })
export default class ApiRoute extends Route<Server> {
	public async [methods.GET](req: Request, res: Response) {
		const fileName = req.params.file;
		const host = req.headers.host || req.hostname;

		const config = Config.getEnv();
		const domain = this.server.domains.get(host);
		if (!domain || domain.disabled) {
			await this.server.next.render(req, res, "/404");
			return;
		}

		const file = await this.server.prisma.file.findFirst({ where: { domain: domain.domain, id: fileName } });

		/** Checks whether or not the user is logged in */
		const checkForAuth = () => {
			const authCookie: string = req.cookies["PAPERPLANE-AUTH"] ?? "";
			if (!authCookie.length) return false;

			const verify = Auth.verifyJWTToken(authCookie, config.encryptionKey, domain.pathId);
			if (!verify) return false;

			return true;
		};

		/** Checks whether or user passed password authentication  */
		const checkForPassword = () => {
			const authCookie: string = req.cookies[`PAPERPLANE-${file!.id}`] ?? "";
			if (!authCookie.length) return false;

			const verify = Auth.verifyJWTToken(authCookie, config.encryptionKey, file!.authSecret);
			if (!verify) return false;

			return true;
		};

		if (!file || (!file.visible && !checkForAuth())) {
			await this.server.next.render(req, res, "/404");
			return;
		}

		// Redirects user to the files login page to authenticate
		if (Boolean(file.password) && !checkForAuth() && !checkForPassword()) {
			res.redirect(`/files/${fileName}/auth`);
			return;
		}

		// Renders the next/app: files/[id] page if embed is enabled or file is a text file
		if (!req.query.raw && (domain.embedEnabled || charset(file.mimeType) === "UTF-8")) {
			await this.server.next.render(req, res, `/files/${fileName}`);
			return;
		}

		// Downloads the file
		if (req.query.download) {
			res.download(file.path, (err) => {
				if (err) {
					res.end();
					return;
				}

				if (!req.query.preview) domain.files.add(file.id);
			});

			return;
		}

		res.sendFile(file.path, (err) => {
			if (err) {
				res.end();
				return;
			}

			if (!req.query.preview) domain.files.add(file.id);
		});
	}
}

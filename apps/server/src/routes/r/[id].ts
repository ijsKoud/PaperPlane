import Config from "#lib/Config.js";
import { Auth } from "#lib/Auth.js";
import type Server from "#server.js";
import { ApplyOptions, Route, methods } from "@snowcrystals/highway";
import type { Request, Response } from "express";

@ApplyOptions<Route.Options>({ ratelimit: { max: 25, windowMs: 1e2 } })
export default class ApiRoute extends Route<Server> {
	public async [methods.GET](req: Request, res: Response) {
		const urlId = req.params.id;
		const host = req.headers.host || req.hostname;

		const config = Config.getEnv();
		const domain = this.server.domains.get(host);
		if (!domain || domain.disabled) {
			await this.server.next.render(req, res, "/404");
			return;
		}

		const url = await this.server.prisma.url.findFirst({ where: { domain: domain.domain, id: urlId } });

		/** Checks whether or not the user is logged in */
		const checkForAuth = () => {
			const authCookie: string = req.cookies["PAPERPLANE-AUTH"] ?? "";
			if (!authCookie.length) return false;

			const verify = Auth.verifyJWTToken(authCookie, config.encryptionKey, domain.pathId);
			if (!verify) return false;

			return true;
		};

		if (!url || (!url.visible && !checkForAuth())) {
			await this.server.next.render(req, res, "/404");
			return;
		}

		res.redirect(url.url);
		domain.urls.add(url.id);
	}
}

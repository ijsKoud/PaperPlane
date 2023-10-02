import { Auth } from "#lib/Auth.js";
import Config from "#lib/Config.js";
import { USER_AUTHENTICATION_COOKIE } from "#lib/constants.js";
import type Server from "#server.js";
import { ApplyOptions, Middleware, methods } from "@snowcrystals/highway";
import type { NextFunction, Request, Response } from "express";

@ApplyOptions<Middleware.Options>({ id: "user-api-key" })
export default class userApiKeyMiddleware extends Middleware<Server> {
	public middleware(req: Request, res: Response, next: NextFunction, context: Record<string, any>) {
		const authHeader = req.headers.authorization ?? "";
		const authCookie: string = req.cookies[USER_AUTHENTICATION_COOKIE] ?? "";
		const config = Config.getEnv();

		try {
			if (authHeader.length) {
				const host = this.server.domains.domains.find((dm) => dm.apiTokens.find((key) => key.token === authHeader));
				if (!host) throw new Error("Unauthorized");

				context.domain = host;
				return next();
			}

			if (authCookie.length) {
				const proxyHost = req.headers["x-forwarded-host"];
				const hostName = proxyHost ? proxyHost : req.headers.host ?? req.hostname;
				const host = this.server.domains.domains.find((dm) => dm.domain.startsWith(Array.isArray(hostName) ? hostName[0] : hostName));

				const verify = Auth.verifyJWTToken(authCookie, config.encryptionKey, host?.pathId || req.hostname);
				if (!verify) throw new Error("Unauthorized");

				context.domain = host;
				return next();
			}

			throw new Error("Unauthorized");
		} catch (err) {
			res.status(401).send({ message: err.message });
		}
	}

	public [methods.POST](req: Request, res: Response, next: NextFunction, context: Record<string, any>) {
		return this.middleware(req, res, next, context);
	}
}

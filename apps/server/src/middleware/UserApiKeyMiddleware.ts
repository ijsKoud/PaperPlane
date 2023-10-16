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

		const unauthorizedError = { field: null, code: "UNAUTHORIZED", messsage: "An API key is required for this api route" };

		try {
			if (authHeader.length) {
				const host = this.server.domains.domains.find((dm) => dm.apiTokens.find((key) => key.token === authHeader));
				if (!host) {
					res.status(404).send({ errors: [unauthorizedError] });
					return;
				}

				context.domain = host;
				return next();
			}

			if (authCookie.length) {
				const proxyHost = req.headers["x-forwarded-host"];
				const hostName = proxyHost ? proxyHost : req.headers.host ?? req.hostname;
				const host = this.server.domains.domains.find((dm) => dm.domain.startsWith(Array.isArray(hostName) ? hostName[0] : hostName));

				const verify = Auth.verifyJWTToken(authCookie, config.encryptionKey, host?.pathId || req.hostname);
				if (!verify) {
					res.status(404).send({ errors: [unauthorizedError] });
					return;
				}

				context.domain = host;
				return next();
			}

			res.status(404).send({ errors: [unauthorizedError] });
		} catch (err) {
			this.server.logger.fatal("[USER_API_KEY_MIDDLEWARE]: Fatal error authenticating user", err);
			res.status(500).send({
				errors: [{ field: null, code: "INTERNAL_SERVER_ERROR", message: "Unknown server error, please try again later." }]
			});
		}
	}

	public [methods.POST](req: Request, res: Response, next: NextFunction, context: Record<string, any>) {
		return this.middleware(req, res, next, context);
	}

	public [methods.DELETE](req: Request, res: Response, next: NextFunction, context: Record<string, any>) {
		return this.middleware(req, res, next, context);
	}

	public [methods.GET](req: Request, res: Response, next: NextFunction, context: Record<string, any>) {
		return this.middleware(req, res, next, context);
	}
}

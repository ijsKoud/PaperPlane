import { Auth } from "#lib/Auth.js";
import Config from "#lib/Config.js";
import { publicProcedure, t } from "#trpc/lib.js";
import { z } from "zod";

export const AuthStateRoute = t.router({
	/** Route to check if user is signed in */
	user: publicProcedure.input(z.string({ required_error: "PAPERPLANE-AUTH cookie is required" })).query((opt) => {
		const { req, server } = opt.ctx;
		const config = Config.getEnv();

		const proxyHost = req.headers["x-forwarded-host"];
		const hostName = proxyHost ? proxyHost : req.headers.host ?? req.hostname;

		const domainAuthHeader = opt.input;
		const domainAuthSecret = Array.isArray(domainAuthHeader) ? domainAuthHeader[0] : domainAuthHeader ?? "";

		const host = server.domains.domains.find((dm) => dm.domain.startsWith(Array.isArray(hostName) ? hostName[0] : hostName));
		const domain = domainAuthSecret ? Auth.verifyJWTToken(domainAuthSecret, config.encryptionKey, host?.pathId || req.hostname) : false;

		return domain;
	})
});

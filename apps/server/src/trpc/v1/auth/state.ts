import { Auth } from "#lib/Auth.js";
import Config from "#lib/Config.js";
import { publicProcedure, t } from "#trpc/lib.js";

export const AuthStateRoute = t.router({
	user: publicProcedure.query((opt) => {
		const { req, server } = opt.ctx;
		const config = Config.getEnv();

		const proxyHost = req.headers["x-forwarded-host"];
		const hostName = proxyHost ? proxyHost : req.headers.host ?? req.hostname;

		const domainAuthHeader = req.cookies["PAPERPLANE-AUTH"];
		const domainAuthSecret = Array.isArray(domainAuthHeader) ? domainAuthHeader[0] : domainAuthHeader ?? "";

		const host = server.domains.domains.find((dm) => dm.domain.startsWith(Array.isArray(hostName) ? hostName[0] : hostName));
		const domain = domainAuthSecret ? Auth.verifyJWTToken(domainAuthSecret, config.encryptionKey, host?.pathId || req.hostname) : false;

		return domain;
	})
});

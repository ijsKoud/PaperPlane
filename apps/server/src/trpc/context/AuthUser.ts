import Config from "#lib/Config.js";
import { TRPCError } from "@trpc/server";
import { t } from "../lib.js";
import { Auth } from "#lib/Auth.js";

const isAuthed = t.middleware((opts) => {
	const { server, req } = opts.ctx;
	const config = Config.getEnv();

	const authCookie = req.cookies["PAPERPLANE-AUTH"];
	if (!authCookie) throw new TRPCError({ code: "UNAUTHORIZED", message: "Valid PAPERPLANE-AUTH cookie is required for this route" });

	const proxyHost = req.headers["x-forwarded-host"];
	const hostName = proxyHost ? proxyHost : req.headers.host ?? req.hostname;

	const host = server.domains.domains.find((dm) => dm.domain.startsWith(Array.isArray(hostName) ? hostName[0] : hostName));
	if (!host) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid PAPERPLANE-AUTH cookie provided" });

	const verify = Auth.verifyJWTToken(authCookie, config.encryptionKey, host?.pathId || req.hostname);
	if (!verify) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid PAPERPLANE-AUTH cookie provided" });

	return opts.next({ ctx: { domain: host } });
});

export const AuthUserProdeduce = t.procedure.use(isAuthed);

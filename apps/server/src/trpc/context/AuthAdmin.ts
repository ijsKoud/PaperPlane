import Config from "#lib/Config.js";
import { TRPCError } from "@trpc/server";
import { t } from "../lib.js";
import { Auth } from "#lib/Auth.js";
import { ADMIN_AUTHENTICATION_COOKIE } from "#lib/constants.js";

const isAuthed = t.middleware((opts) => {
	const { req } = opts.ctx;
	const config = Config.getEnv();

	const authCookie = req.cookies[ADMIN_AUTHENTICATION_COOKIE];
	if (!authCookie) throw new TRPCError({ code: "UNAUTHORIZED", message: `Valid ${ADMIN_AUTHENTICATION_COOKIE} cookie is required for this route` });

	const verify = Auth.verifyJWTToken(authCookie, config.encryptionKey, "admin");
	if (!verify) throw new TRPCError({ code: "UNAUTHORIZED", message: `Invalid ${ADMIN_AUTHENTICATION_COOKIE} cookie provided` });

	return opts.next();
});

export const AuthAdminProdeduce = t.procedure.use(isAuthed);

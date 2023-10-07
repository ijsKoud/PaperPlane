import Config from "#lib/Config.js";
import { TRPCError } from "@trpc/server";
import { t } from "../lib.js";
import { Auth } from "#lib/Auth.js";

const isAuthed = t.middleware((opts) => {
	const { req } = opts.ctx;
	const config = Config.getEnv();

	const authCookie = req.cookies["PAPERPLANE-ADMIN"];
	if (!authCookie) throw new TRPCError({ code: "UNAUTHORIZED", message: "Valid PAPERPLANE-AADMINUTH cookie is required for this route" });

	const verify = Auth.verifyJWTToken(authCookie, config.encryptionKey, "admin");
	if (!verify) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid PAPERPLANE-ADMIN cookie provided" });

	return opts.next();
});

export const AuthAdminProdeduce = t.procedure.use(isAuthed);

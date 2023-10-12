import Config from "#lib/Config.js";
import { TRPCError } from "@trpc/server";
import { t } from "../lib.js";

const isAuthed = t.middleware((opts) => {
	const apiKeyHeader = opts.ctx.req.headers["x-paperplane-api"];
	const apiAuthentication = apiKeyHeader === Config.getEnv().internalApiKey;

	if (!apiAuthentication) throw new TRPCError({ code: "UNAUTHORIZED", message: "Internal API KEY is required for this route" });
	return opts.next({ ctx: {} });
});

export const ApiKeyProcedure = t.procedure.use(isAuthed);

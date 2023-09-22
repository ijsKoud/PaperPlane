import FieldError from "#errors/FIeldError.js";
import type Server from "#server.js";
import { TRPCError, initTRPC } from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";

export function createContext(server: Server, opts: trpcExpress.CreateExpressContextOptions) {
	return { server, ...opts };
}

export const t = initTRPC.context<typeof createContext>().create();
export const publicProcedure = t.procedure;

export function createFieldError(field: string, message: string) {
	const fieldError = new FieldError(field, message);
	return new TRPCError({
		code: "BAD_REQUEST",
		message: fieldError.getJSONStringified()
	});
}

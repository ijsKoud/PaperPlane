import type Server from "#server.js";
import { createContext, t } from "./lib.js";
import { v1Route } from "./v1/index.js";
import * as trpcExpress from "@trpc/server/adapters/express";

const appRouter = t.router({
	v1: v1Route
});

export default appRouter;

export function getTrpcMiddleware(server: Server) {
	const trpcMiddleware = trpcExpress.createExpressMiddleware({
		createContext: (opts) => createContext(server, opts),
		router: appRouter
	});

	return trpcMiddleware;
}

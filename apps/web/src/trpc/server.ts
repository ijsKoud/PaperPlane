import { createTRPCProxyClient, httpBatchLink, loggerLink } from "@trpc/client";
import type AppRouter from "server/dist/trpc";
import { getProtocol } from "@paperplane/utils";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

export type PaperPlaneApiEndpoints = typeof AppRouter;
export type PaperPlaneApiInputs = inferRouterInputs<PaperPlaneApiEndpoints>;
export type PaperPlaneApiOutputs = inferRouterOutputs<PaperPlaneApiEndpoints>;

export const api = (host?: string) =>
	createTRPCProxyClient<PaperPlaneApiEndpoints>({
		links: [
			loggerLink({
				enabled: (op) => process.env.NODE_ENV === "development" || (op.direction === "down" && op.result instanceof Error)
			}),
			httpBatchLink({
				url: host ? `${getProtocol()}${host}/trpc` : "/trpc",
				headers: (ctx) => {
					if (host) return { "x-paperplane-api": process.env.INTERNAL_API_KEY! };

					return {
						cookie: document.cookie
					};
				}
			})
		]
	});

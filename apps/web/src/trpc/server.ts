import { createTRPCProxyClient, httpBatchLink, loggerLink } from "@trpc/client";
import type AppRouter from "server/dist/trpc";
import { getProtocol } from "@paperplane/utils";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import superjson from "superjson";

export type PaperPlaneApiEndpoints = typeof AppRouter;
export type PaperPlaneApiInputs = inferRouterInputs<PaperPlaneApiEndpoints>;
export type PaperPlaneApiOutputs = inferRouterOutputs<PaperPlaneApiEndpoints>;

export const api = (host?: string | undefined, opt?: { cookie?: string }) => {
	const LoggerLink = loggerLink({
		enabled: (op) => process.env.NODE_ENV === "development" || (op.direction === "down" && op.result instanceof Error)
	});

	const httpLink = httpBatchLink({
		url: host ? `${getProtocol()}${host}/trpc` : "/trpc",
		headers: () => {
			if (host) return { "x-paperplane-api": process.env.INTERNAL_API_KEY!, cookie: opt?.cookie };

			return {
				cookie: opt?.cookie ?? document.cookie
			};
		}
	});

	const client = createTRPCProxyClient<PaperPlaneApiEndpoints>({
		transformer: superjson as any,
		links: [LoggerLink, httpLink]
	});

	return client;
};

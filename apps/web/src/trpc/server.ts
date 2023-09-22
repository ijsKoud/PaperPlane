import { createTRPCProxyClient, httpBatchLink, loggerLink } from "@trpc/client";
import type AppRouter from "server/dist/trpc";
import { getProtocol } from "@paperplane/utils";
import { ApiKeyProtectedRoutes } from "./shared";

export const api = (host?: string) =>
	createTRPCProxyClient<typeof AppRouter>({
		links: [
			loggerLink({
				enabled: (op) => process.env.NODE_ENV === "development" || (op.direction === "down" && op.result instanceof Error)
			}),
			httpBatchLink({
				url: host ? `${getProtocol()}${host}/trpc` : "/trpc",
				headers: (ctx) => {
					if (ApiKeyProtectedRoutes.includes(ctx.opList[0].path)) return { "x-paperplane-api": process.env.INTERNAL_API_KEY! };
					if (!host)
						return {
							cookie: document.cookie
						};

					return {};
				}
			})
		]
	});

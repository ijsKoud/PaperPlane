import { t } from "#trpc/lib.js";
import { AuthRoute } from "./auth/index.js";

export const v1Route = t.router({
	auth: AuthRoute
});

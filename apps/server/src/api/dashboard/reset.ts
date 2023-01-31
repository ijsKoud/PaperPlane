import type { Response } from "express";
import { Auth } from "../../lib/Auth.js";
import type { DashboardRequest, Middleware, RequestMethods } from "../../lib/types.js";
import type Server from "../../Server.js";

export default async function handler(server: Server, req: DashboardRequest, res: Response) {
	if (!req.locals.domain) {
		res.status(500).send({ message: "Internal server error, please try again later." });
		return;
	}

	await req.locals.domain.reset();
	res.sendStatus(204);
}

export const methods: RequestMethods[] = ["delete"];
export const middleware: Middleware[] = [Auth.userMiddleware.bind(Auth)];

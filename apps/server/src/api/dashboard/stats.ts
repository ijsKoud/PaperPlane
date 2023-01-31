import type { Response } from "express";
import { Auth } from "../../lib/Auth.js";
import type { DashboardRequest, Middleware, RequestMethods } from "../../lib/types.js";
import type Server from "../../Server.js";

export default function handler(server: Server, req: DashboardRequest, res: Response) {
	if (!req.locals.domain) {
		res.status(500).send({ message: "Internal server error, please try again later." });
		return;
	}

	res.send({
		files: 0,
		shorturls: 0,
		storage: {
			total: req.locals.domain.maxStorage,
			used: req.locals.domain.storage
		}
	});
}

export const methods: RequestMethods[] = ["get"];
export const middleware: Middleware[] = [Auth.userMiddleware.bind(Auth)];

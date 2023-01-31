import type { Response } from "express";
import { Auth } from "../../lib/Auth.js";
import type { DashboardRequest, Middleware, RequestMethods } from "../../lib/types.js";
import type Server from "../../Server.js";

export default function handler(server: Server, req: DashboardRequest, res: Response) {
	if (!req.locals.domain) {
		res.status(500).send({ message: "Internal server error, please try again later." });
		return;
	}

	if (server.envConfig.authMode === "2fa") {
		const auth = server.auth.generateAuthReset(req.locals.domain.domain);
		res.send(auth);
		return;
	}

	res.send({ key: "", secret: "", uri: "" });
}

export const methods: RequestMethods[] = ["post"];
export const middleware: Middleware[] = [Auth.userMiddleware.bind(Auth)];

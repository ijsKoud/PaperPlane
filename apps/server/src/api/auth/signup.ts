import type { Response, Request } from "express";
import type { RequestMethods } from "../../lib/types.js";
import type Server from "../../Server.js";

export default function handler(server: Server, req: Request, res: Response) {
	if (req.headers["x-paperplane-api"] !== server.envConfig.internalApiKey) {
		res.status(401).send({ message: "Unauthorized request" });
		return;
	}

	res.send({
		mode: server.envConfig.signUpMode,
		type: server.envConfig.authMode
	});
}

export const methods: RequestMethods[] = ["get"];

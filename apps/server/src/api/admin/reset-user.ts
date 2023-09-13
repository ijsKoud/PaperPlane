import type { Response, Request } from "express";
import { Auth } from "../../lib/Auth.js";
import type { Middleware, RequestMethods } from "../../lib/types.js";
import type Server from "../../Server.js";

export default async function handler(server: Server, req: Request, res: Response) {
	try {
		const { domain: domainName } = req.body;
		if (typeof domainName !== "string") {
			res.status(400).send({ message: "Invalid domain provided." });
			return;
		}

		const domain = server.domains.get(domainName);
		if (!domain) {
			res.status(400).send({ message: "Invalid domain provided." });
			return;
		}

		await domain.resetAuth();
		res.sendStatus(204);
	} catch (err) {
		server.logger.fatal(`[RESET:POST]: Fatal error while resetting the encryption key`, err);
		res.status(500).send({ message: "Internal server error occured, please try again later." });
	}
}

export const methods: RequestMethods[] = ["post"];
export const middleware: Middleware[] = [Auth.adminMiddleware.bind(Auth)];

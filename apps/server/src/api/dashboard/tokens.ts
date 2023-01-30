import type { Response } from "express";
import { Auth } from "../../lib/Auth.js";
import type { DashboardRequest, Middleware, RequestMethods } from "../../lib/types.js";
import type Server from "../../Server.js";

export default async function handler(server: Server, req: DashboardRequest, res: Response) {
	if (!req.locals.domain) {
		res.status(500).send({ message: "Internal server error, please try again later." });
		return;
	}

	if (req.method === "POST") {
		try {
			const data = req.body as { name: string };
			if (typeof data.name !== "string") {
				res.status(400).send({ message: "Invalid name provided" });
				return;
			}

			if (req.locals.domain.apiTokens.find((token) => token.name === data.name)) {
				res.status(400).send({ message: "Token with this name already exists" });
				return;
			}

			const token = await req.locals.domain.createToken(data.name);
			req.locals.domain.auditlogs.register("Token Created", `Name: ${data.name}`);
			res.send(token.token);
			return;
		} catch (err) {
			server.logger.fatal(`[TOKENS:POST]: Fatal error while updating a PaperPlane account `, err);
			res.status(500).send({ message: "Internal server error occured, please try again later." });
			return;
		}
	}

	if (req.method === "DELETE") {
		try {
			const data = req.body as { tokens: string[] };
			if (!Array.isArray(data.tokens)) {
				res.status(400).send({ message: "Invalid tokens array provided" });
				return;
			}

			const filtered = data.tokens.filter((token) => typeof token === "string");
			await req.locals.domain.deleteTokens(filtered);
			req.locals.domain.auditlogs.register("Token Delted", `Tokens: ${filtered.join(",")}`);
			res.sendStatus(204);
			return;
		} catch (err) {
			server.logger.fatal(`[TOKENS:DELETE]: Fatal error while updating a PaperPlane account `, err);
			res.status(500).send({ message: "Internal server error occured, please try again later." });
		}
	}
}

export const methods: RequestMethods[] = ["post", "delete"];
export const middleware: Middleware[] = [Auth.userMiddleware.bind(Auth)];

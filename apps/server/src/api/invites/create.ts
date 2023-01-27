import type { Response, Request } from "express";
import { Auth } from "../../lib/Auth.js";
import type { Middleware, RequestMethods } from "../../lib/types.js";
import type Server from "../../Server.js";

export default async function handler(server: Server, req: Request, res: Response) {
	if (req.method === "POST") {
		const invite = await server.domains.createInvite();
		res.send(invite);

		return;
	}

	const { invites: _invites } = req.body;
	if (!Array.isArray(_invites)) {
		res.status(400).send({ message: "Incorrect invite provided" });
		return;
	}

	const invites: string[] = _invites.filter((inv) => typeof inv === "string");
	await Promise.all(invites.map((inv) => server.domains.deleteInvite(inv)));

	res.sendStatus(204);
}

export const methods: RequestMethods[] = ["post", "delete"];
export const middleware: Middleware[] = [Auth.adminMiddleware.bind(Auth)];

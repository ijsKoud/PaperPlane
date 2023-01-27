import type { Response, Request } from "express";
import { Auth } from "../../lib/Auth.js";
import type { Middleware, RequestMethods } from "../../lib/types.js";
import type Server from "../../Server.js";

export default async function handler(server: Server, req: Request, res: Response) {
	const invite = await server.domains.createInvite();

	res.send(invite);
}

export const methods: RequestMethods[] = ["post"];
export const middleware: Middleware[] = [Auth.adminMiddleware.bind(Auth)];

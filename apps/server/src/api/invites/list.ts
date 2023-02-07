import type { Response, Request } from "express";
import { Auth } from "../../lib/Auth.js";
import type { Middleware, RequestMethods } from "../../lib/types.js";
import { Utils } from "../../lib/utils.js";
import type Server from "../../Server.js";

export default function handler(server: Server, req: Request, res: Response) {
	const { page: _page } = req.query;
	const page = isNaN(Number(_page)) ? 0 : Number(_page);

	const { invites } = server.domains;
	const chunks = Utils.chunk(invites, 50);
	const chunk = page > chunks.length ? chunks[chunks.length - 1] : chunks[page];

	res.send({
		entries: chunk ?? [],
		pages: chunks.length
	});
}

export const methods: RequestMethods[] = ["get"];
export const middleware: Middleware[] = [Auth.adminMiddleware.bind(Auth)];

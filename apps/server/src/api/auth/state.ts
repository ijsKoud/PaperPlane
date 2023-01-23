import type { Response, Request } from "express";
import { Auth } from "../../lib/Auth.js";
import type { RequestMethods } from "../../lib/types.js";
import type Server from "../../Server.js";

export default function handler(server: Server, req: Request, res: Response) {
	const admin = Auth.verifyJWTToken(req.cookies["PAPERPLANE-ADMIN"], server._config.config.encryptionKey, "admin");

	res.send({
		domains: [],
		admin
	});
}

export const methods: RequestMethods[] = ["get"];

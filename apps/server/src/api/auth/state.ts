import type { Response, Request } from "express";
import { Auth } from "../../lib/Auth.js";
import type { RequestMethods } from "../../lib/types.js";
import type Server from "../../Server.js";

export default function handler(server: Server, req: Request, res: Response) {
	const adminAuthHeader = req.headers["x-paperplane-admin-key"];
	const adminAuthSecret = Array.isArray(adminAuthHeader) ? adminAuthHeader[0] : adminAuthHeader ?? "";
	const admin = Auth.verifyJWTToken(adminAuthSecret, server._config.config.encryptionKey, "admin");

	res.send({
		domains: [],
		admin
	});
}

export const methods: RequestMethods[] = ["get"];

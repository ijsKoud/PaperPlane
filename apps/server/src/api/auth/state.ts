import type { Response, Request } from "express";
import { Auth } from "../../lib/Auth.js";
import type { RequestMethods } from "../../lib/types.js";
import type Server from "../../Server.js";

export default function handler(server: Server, req: Request, res: Response) {
	const adminAuthHeader = req.headers["x-paperplane-admin-key"];
	const adminAuthSecret = Array.isArray(adminAuthHeader) ? adminAuthHeader[0] : adminAuthHeader ?? "";
	const admin = adminAuthSecret ? Auth.verifyJWTToken(adminAuthSecret, server.envConfig.encryptionKey, "admin") : false;

	res.send({
		domain: false,
		admin
	});
}

export const methods: RequestMethods[] = ["get"];

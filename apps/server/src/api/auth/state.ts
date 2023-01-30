import type { Response, Request } from "express";
import { Auth } from "../../lib/Auth.js";
import type { RequestMethods } from "../../lib/types.js";
import type Server from "../../Server.js";

export default function handler(server: Server, req: Request, res: Response) {
	const adminAuthHeader = req.headers["x-paperplane-admin-key"];
	const adminAuthSecret = Array.isArray(adminAuthHeader) ? adminAuthHeader[0] : adminAuthHeader ?? "";
	const admin = adminAuthSecret ? Auth.verifyJWTToken(adminAuthSecret, server.envConfig.encryptionKey, "admin") : false;

	const proxyHost = req.headers["x-forwarded-host"];
	const hostName = proxyHost ? proxyHost : req.headers.host ?? req.hostname;

	const host = server.domains.domains.find((dm) => dm.domain.startsWith(Array.isArray(hostName) ? hostName[0] : hostName));
	const domainAuthHeader = req.headers["x-paperplane-auth-key"];
	const domainAuthSecret = Array.isArray(domainAuthHeader) ? domainAuthHeader[0] : domainAuthHeader ?? "";
	const domain = domainAuthSecret ? Auth.verifyJWTToken(domainAuthSecret, server.envConfig.encryptionKey, host?.domain || req.hostname) : false;

	res.send({
		domain,
		admin
	});
}

export const methods: RequestMethods[] = ["get"];

import type { Response, Request } from "express";
import { Auth } from "../../lib/Auth.js";
import type { Middleware, RequestMethods } from "../../lib/types.js";
import type Server from "../../Server.js";

export default async function handler(server: Server, req: Request, res: Response) {
	if (req.method === "GET") {
		const domains = await server.prisma.signupDomain.findMany();

		res.send({
			defaults: {
				extensions: server.envConfig.extensionsList,
				extensionsMode: server.envConfig.extensionsMode,
				maxStorage: server.envConfig.maxStorage,
				maxUploadSize: server.envConfig.maxUpload,
				auditlog: server.envConfig.auditLogDuration
			},
			domains: domains.map((domain) => domain.domain)
		});
	}
}

export const methods: RequestMethods[] = ["get", "post"];
export const middleware: Middleware[] = [Auth.adminMiddleware.bind(Auth)];

import type { Response, Request } from "express";
import { Auth } from "../../lib/Auth.js";
import type { Middleware, RequestMethods } from "../../lib/types.js";
import type Server from "../../Server.js";

export default async function handler(server: Server, req: Request, res: Response) {
	const domains = await server.prisma.domain.count();
	const { version, authMode, signUpMode } = server.envConfig;
	const { uptime } = server;

	res.send({
		version,
		authMode,
		signUpMode,
		uptime,
		users: domains,
		storageUsage: server.storageUsage,
		cpuUsage: server.cpuUsage,
		memory: server.memory
	});
}

export const methods: RequestMethods[] = ["get"];
export const middleware: Middleware[] = [Auth.adminMiddleware.bind(Auth)];

import type { Response, Request } from "express";
import type { RequestMethods } from "../../lib/types.js";
import type Server from "../../Server.js";

export default async function handler(server: Server, req: Request, res: Response) {
	if (req.headers["x-paperplane-api"] !== server.envConfig.internalApiKey) {
		res.status(401).send({ message: "Unauthorized request" });
		return;
	}

	const domains = await server.prisma.domain.findMany({ where: { disabled: false } });
	const options = domains.map((domain) => ({ value: domain.domain, label: domain.domain }));

	res.send({
		options: [...options, { value: "admin", label: "Application Admin" }],
		mode: server.envConfig.authMode
	});
}

export const methods: RequestMethods[] = ["get"];

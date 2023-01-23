import type { Response, Request } from "express";
import type { RequestMethods } from "../../lib/types.js";
import type Server from "../../Server.js";

export default async function handler(server: Server, req: Request, res: Response) {
	if (req.headers["x-paperplane-api"] !== server._config.config.internalApiKey) {
		res.status(401).send({ message: "Unauthorized request" });
		return;
	}

	const domains = await server.prisma.domain.findMany({ where: { disabled: false } });
	const options = domains.map((domain) => ({ value: domain.domain, label: domain.domain }));

	res.send({
		options: [...options, { value: "admin", label: "Application Admin" }],
		mode: server._config.config.authMode
	});
}

export const methods: RequestMethods[] = ["get"];

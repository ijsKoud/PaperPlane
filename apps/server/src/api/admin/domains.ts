import type { Response, Request } from "express";
import { Auth } from "../../lib/Auth.js";
import type { Middleware, RequestMethods } from "../../lib/types.js";
import { Utils } from "../../lib/utils.js";
import type Server from "../../Server.js";

export default async function handler(server: Server, req: Request, res: Response) {
	if (req.method === "GET") {
		const { page: _page } = req.query;
		const page = isNaN(Number(_page)) ? 0 : Number(_page);

		const domains = await server.prisma.signupDomain.findMany();
		const chunks = Utils.chunk(domains, 50);
		const chunk = page > chunks.length ? chunks[chunks.length - 1] : chunks[page];

		res.send({
			entries: chunk ?? [],
			pages: chunks.length
		});

		return;
	}

	if (req.method === "POST") {
		const { domain } = req.body;
		if (typeof domain !== "string") {
			res.status(400).send({ message: "Invalid domain provided" });
			return;
		}

		if (domain.startsWith(".") || domain.endsWith(".") || domain.startsWith("-")) {
			res.status(400).send({ message: "Invalid domain provided" });
			return;
		}

		server.adminAuditLogs.register("SignUp Domain Create", `Domain: ${domain}`);
		await server.prisma.signupDomain.create({ data: { domain } });
		res.sendStatus(204);
		return;
	}

	if (req.method === "DELETE") {
		const { domains } = req.body;
		if (!Array.isArray(domains)) {
			res.status(400).send({ message: "Invalid domains provided" });
			return;
		}

		server.adminAuditLogs.register("SignUp Domains Delete", `Domains: ${domains.join(",")}`);
		await server.prisma.signupDomain.deleteMany({ where: { domain: { in: domains } } });
		res.sendStatus(204);
	}
}

export const methods: RequestMethods[] = ["get", "post", "delete"];
export const middleware: Middleware[] = [Auth.adminMiddleware.bind(Auth)];

import type { Response, Request } from "express";
import { Auth } from "../../lib/Auth.js";
import type { Middleware, RequestMethods } from "../../lib/types.js";
import type Server from "../../Server.js";

export default function handler(server: Server, req: Request, res: Response) {
	const { domain: _domain } = req.query;
	const domain = server.domains.get(typeof _domain === "string" ? _domain : "");

	if (!domain) {
		res.status(400).send({ message: "Invalid domain provided" });
		return;
	}

	res.send({
		defaults: {
			disabled: domain.disabled,
			extensions: domain.extensions,
			extensionsMode: domain.extensionsMode,
			maxStorage: domain.maxStorage,
			maxUploadSize: domain.uploadSize,
			auditlog: domain.auditlogDuration
		}
	});
}

export const methods: RequestMethods[] = ["get"];
export const middleware: Middleware[] = [Auth.adminMiddleware.bind(Auth)];

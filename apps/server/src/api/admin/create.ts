import type { Response, Request } from "express";
import _ from "lodash";
import ms from "ms";
import { Auth } from "../../lib/Auth.js";
import type { CreateUserFormBody, Middleware, RequestMethods, UpdateUserFormBody } from "../../lib/types.js";
import type Server from "../../Server.js";

export default async function handler(server: Server, req: Request, res: Response) {
	const domains = await server.prisma.signupDomain.findMany();

	if (req.method === "GET") {
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

		return;
	}

	if (req.method === "POST") {
		try {
			const data = req.body as Required<CreateUserFormBody>;
			if (!data.domain || !domains.map((domain) => domain.domain).includes(data.domain)) {
				res.status(400).send({ message: "Invalid sign-up domain provided" });
				return;
			}

			const DOMAIN_REGEX = /[A-Za-z0-9](?:[A-Za-z0-9\-]{0,61}[A-Za-z0-9])?/g;
			const extensionRes = (data.extension ?? "").match(DOMAIN_REGEX) ?? [];
			data.extension = extensionRes[0] ?? "";

			if (data.domain.startsWith("*.") && !data.extension.length) {
				res.status(400).send({ message: "Invalid sign-up subdomain provided" });
				return;
			}

			if (!["block", "pass"].includes(data.extensionsMode)) {
				res.status(400).send({ message: "Invalid extensionMode provided" });
				return;
			}

			const auditlog = ms(data.auditlog);
			if (isNaN(auditlog)) {
				res.status(400).send({ message: "Invalid auditlog duration provided" });
				return;
			}

			data.extensions = data.extensions.filter((ext) => ext.startsWith(".") && !ext.endsWith("."));
			const domain = data.domain.startsWith("*.") ? `` : data.domain;

			await server.domains.create({
				disabled: false,
				domain,
				extensionsList: data.extensions.join(","),
				extensionsMode: data.extensionsMode,
				maxStorage: data.storage,
				maxUploadSize: data.uploadSize,
				auditlogDuration: data.auditlog
			});

			if (!data.domain.startsWith("*.")) {
				await server.prisma.signupDomain.delete({ where: { domain: data.domain } });
			}

			server.adminAuditLogs.register("Create User", `User: ${data.domain} (${server.domains.get(data.domain)!.filesPath})`);
			res.sendStatus(204);
			return;
		} catch (err) {
			server.logger.fatal(`[CREATE:POST]: Fatal error while creating a new PaperPlane account `, err);
			res.status(500).send({ message: "Internal server error occured, please try again later." });
		}
	}

	if (req.method === "PUT") {
		try {
			const data = req.body as Required<UpdateUserFormBody>;
			if (!Array.isArray(data.domains)) {
				res.status(400).send({ message: "Invalid domains array provided" });
				return;
			}

			if (!_.isBoolean(data.disabled)) {
				res.status(400).send({ message: "Invalid disabled value provided" });
				return;
			}

			if (!["block", "pass"].includes(data.extensionsMode)) {
				res.status(400).send({ message: "Invalid extensionMode provided" });
				return;
			}

			const auditlog = ms(data.auditlog);
			if (isNaN(auditlog)) {
				res.status(400).send({ message: "Invalid auditlog duration provided" });
				return;
			}

			data.extensions = data.extensions.filter((ext) => ext.startsWith(".") && !ext.endsWith("."));

			await server.domains.update(data.domains, {
				disabled: false,
				extensionsList: data.extensions.join(","),
				extensionsMode: data.extensionsMode,
				maxStorage: data.storage,
				maxUploadSize: data.uploadSize,
				auditlogDuration: data.auditlog
			});
			res.sendStatus(204);
			return;
		} catch (err) {
			server.logger.fatal(`[CREATE:POST]: Fatal error while creating a new PaperPlane account `, err);
			res.status(500).send({ message: "Internal server error occured, please try again later." });
		}
	}
}

export const methods: RequestMethods[] = ["get", "post", "put"];
export const middleware: Middleware[] = [Auth.adminMiddleware.bind(Auth)];

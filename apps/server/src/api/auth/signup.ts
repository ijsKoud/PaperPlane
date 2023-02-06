import type { Response, Request } from "express";
import type { RequestMethods } from "../../lib/types.js";
import type Server from "../../Server.js";
import { Auth } from "../../lib/Auth.js";
import ms from "ms";

export default async function handler(server: Server, req: Request, res: Response) {
	const domains = await server.prisma.signupDomain.findMany();

	if (req.method === "GET") {
		if (req.headers["x-paperplane-api"] !== server.envConfig.internalApiKey) {
			res.status(401).send({ message: "Unauthorized request" });
			return;
		}

		res.send({
			mode: server.envConfig.signUpMode,
			type: server.envConfig.authMode,
			domains: domains.map((dm) => dm.domain)
		});
		return;
	}

	if (server.envConfig.signUpMode === "closed") {
		res.status(403).send({ message: "Not allowed" });
		return;
	}

	if (req.method === "POST") {
		if (server.envConfig.authMode === "2fa") {
			const auth = server.auth.generateAuthReset("DOMAIN_PLACEHOLDER");
			res.send(auth);
			return;
		}

		res.send({ key: "", secret: "", uri: "" });
		return;
	}

	if (req.method === "PATCH") {
		const data = req.body as { key?: string; auth: string; invite?: string; extension?: string; domain: string };

		if (!domains.map((dm) => dm.domain).includes(data.domain)) {
			res.status(400).send({ message: "Invalid domain provided" });
			return;
		}

		if (
			(data.domain.startsWith("*.") && typeof data.extension !== "string") ||
			data.extension?.startsWith("-") ||
			data.extension?.endsWith("-")
		) {
			res.status(400).send({ message: "Invalid subdomain provided" });
			return;
		}

		const domain = data.extension ? `${data.extension}.${data.domain.replace("*.", "")}` : data.domain;
		let deleteInvite = false;

		if (server.envConfig.signUpMode === "invite") {
			if (typeof data.invite !== "string") {
				res.status(400).send({ message: "Invalid invite provided" });
				return;
			}

			const invite = await server.prisma.invites.findFirst({ where: { invite: data.invite } });
			if (!invite) {
				res.status(400).send({ message: "Invalid invite provided" });
				return;
			}

			deleteInvite = true;
		}

		if (server.envConfig.authMode === "2fa") {
			if (typeof data.key !== "string" || !server.auth.authReset.has(data.key)) {
				res.status(400).send({ message: "Missing 2FA key, please refresh the page" });
				return;
			}

			if (typeof data.auth !== "string" || data.auth.length !== 6) {
				res.status(400).send({ message: "Invalid 2FA code provided" });
				return;
			}

			const authData = server.auth.authReset.get(data.key)!;
			const authRes = Auth.verify2FASecret(authData.token, data.auth);

			if (!authRes || authRes.delta !== 0) {
				res.status(400).send({ message: "Invalid 2FA code provided" });
				return;
			}

			const codes = Auth.generateBackupCodes();
			await server.domains.create({
				twoFactorSecret: authData.token,
				backupCodes: codes.join(","),
				disabled: false,
				domain,
				auditlogDuration: ms(server.envConfig.auditLogDuration),
				extensionsList: server.envConfig.extensionsList.join(","),
				extensionsMode: server.envConfig.extensionsMode,
				maxStorage: server.config.parseStorage(server.envConfig.maxStorage),
				maxUploadSize: server.config.parseStorage(server.envConfig.maxUpload)
			});

			clearTimeout(authData.timeout);
			server.auth.authReset.delete(data.key);

			if (deleteInvite) await server.prisma.invites.delete({ where: { invite: data.invite } });
			if (!data.domain.startsWith("*.")) await server.prisma.signupDomain.delete({ where: { domain: data.domain } });

			res.send(codes);
			return;
		}

		if (typeof data.auth !== "string") {
			res.status(400).send({ message: "Invalid password provided" });
			return;
		}

		const codes = Auth.generateBackupCodes();
		const hashed = Auth.encryptPassword(data.auth, server.envConfig.encryptionKey);
		await server.domains.create({
			password: hashed,
			backupCodes: codes.join(","),
			disabled: false,
			domain,
			auditlogDuration: ms(server.envConfig.auditLogDuration),
			extensionsList: server.envConfig.extensionsList.join(","),
			extensionsMode: server.envConfig.extensionsMode,
			maxStorage: server.config.parseStorage(server.envConfig.maxStorage),
			maxUploadSize: server.config.parseStorage(server.envConfig.maxUpload)
		});

		res.send(codes);
	}
}

export const methods: RequestMethods[] = ["get", "post", "patch"];

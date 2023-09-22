import { AuditLog } from "#components/AuditLog.js";
import Config from "#lib/Config.js";
import { Auth } from "#lib/index.js";
import { ApiKeyProcedure } from "#trpc/context/ApiKey.js";
import { createFieldError, publicProcedure, t } from "#trpc/lib.js";
import { TRPCError } from "@trpc/server";
import { scryptSync, timingSafeEqual } from "node:crypto";
import { z } from "zod";

export const AuthRoute = t.router({
	accounts: ApiKeyProcedure.query(async (opts) => {
		const domains = await opts.ctx.server.prisma.domain.findMany({ where: { disabled: false } });
		const options = domains.map((domain) => domain.domain);

		return { accounts: options, mode: Config.getEnv().authMode };
	}),
	login: publicProcedure
		.input(
			z.object({
				domain: z.string({ required_error: "Invalid domain provided" }),
				code: z.string().length(6, "The code should be 6 characters long").optional(),
				password: z.string().optional()
			})
		)
		.mutation(async (opts) => {
			const config = Config.getEnv();
			const { server, req, res } = opts.ctx;
			const { code, password, domain: _domain } = opts.input;

			const ua = AuditLog.getUserAgentData(req.headers["user-agent"]);

			const domain = server.domains.get(_domain);
			if (!domain && _domain !== "admin") throw createFieldError("input.domain", "Invalid domain provided");

			// BACKUP CODE Authentication
			if (code && code.startsWith("BC-")) {
				if (!domain) throw createFieldError("input.domain", "Cannot access admin panel with backup codes");

				const sliced = code.slice(3, code.length);
				if (!domain.codes.includes(sliced)) throw createFieldError("input.code", "Invalid backup code provided");

				await domain.removeCode(sliced);
				domain.auditlogs.register("Login: Backup Code", `${ua.browser.name}-${ua.browser.version} on ${ua.os.name}-${ua.os.version}`);
				res.cookie("PAPERPLANE-AUTH", Auth.createJWTToken(domain.pathId, config.encryptionKey), { maxAge: 6.048e8 });
				return;
			}

			// MFA CODE AUTHENTICATION
			if (code) {
				// ADMIN AUTHENTICATION
				if (_domain === "admin") {
					const authSecret = config.admin2FASecret;
					const authRes = Auth.verify2FASecret(authSecret, code);
					if (!authRes || authRes.delta !== 0) throw createFieldError("input.code", "Invalid MFA code provided");

					server.adminAuditLogs.register("Login", `${ua.browser.name}-${ua.browser.version} on ${ua.os.name}-${ua.os.version}`);
					res.cookie("PAPERPLANE-ADMIN", Auth.createJWTToken("admin", config.encryptionKey), { maxAge: 6.048e8 });
					return;
				}

				// For intellisense
				if (!domain)
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Internal server error, please try again later."
					});

				const authSecret = domain.secret;
				const authRes = Auth.verify2FASecret(authSecret, code);
				if (!authRes || authRes.delta !== 0) throw createFieldError("input.code", "Invalid MFA code provided");

				domain.auditlogs.register("Login", `${ua.browser.name}-${ua.browser.version} on ${ua.os.name}-${ua.os.version}`);
				res.cookie("PAPERPLANE-AUTH", Auth.createJWTToken(domain.pathId, config.encryptionKey), { maxAge: 6.048e8 });
				return;
			}

			// For intellisense
			if (!domain)
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Internal server error, please try again later.",
					cause: "server"
				});

			// PASSWORD AUTHENTICATION
			if (!password) throw createFieldError("input.password", "Invalid password provided");
			const [salt, key] = Auth.decryptToken(domain!.secret, config.encryptionKey).split(":");
			const passwordBuffer = scryptSync(password, salt, 64);

			const keyBuffer = Buffer.from(key, "hex");
			const match = timingSafeEqual(passwordBuffer, keyBuffer);
			if (!match) throw createFieldError("input.password", "Invalid password provided");

			domain.auditlogs.register("Login", `${ua.browser.name}-${ua.browser.version} on ${ua.os.name}-${ua.os.version}`);
			res.cookie("PAPERPLANE-AUTH", Auth.createJWTToken(domain!.pathId, config.encryptionKey), { maxAge: 6.048e8 });
		})
});

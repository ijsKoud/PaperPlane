import { Auth } from "#lib/Auth.js";
import Config from "#lib/Config.js";
import { Utils } from "#lib/index.js";
import { createFieldError, publicProcedure, t } from "#trpc/lib.js";
import { TRPCError } from "@trpc/server";
import ms from "ms";
import { z } from "zod";

export const SignUpAuthRoute = t.router({
	mfa: publicProcedure.query((opt) => {
		const config = Config.getEnv();
		if (config.authMode !== "2fa") return null;

		const auth = opt.ctx.server.auth.generateAuthReset("DOMAIN_PLACEHOLDER");
		return auth;
	}),
	options: publicProcedure.query(async (opt) => {
		const config = Config.getEnv();
		const domains = await opt.ctx.server.prisma.signupDomain.findMany();

		return {
			mode: config.signUpMode,
			type: config.authMode,
			domains: domains.map((domain) => domain.domain)
		};
	}),
	createMfa: publicProcedure
		.input(
			z.object({
				key: z.string({ required_error: "Missing a MFA key, please refresh the page" }),
				domain: z.string({ required_error: "A valid domain is required" }),
				extension: z.string().optional(),
				invite: z.string().optional(),
				auth: z
					.string({ required_error: "A 6 digit two factor authentication code is required" })
					.length(6, { message: "The code should be 6 digits long" })
			})
		)
		.mutation(async (opt) => {
			const { ctx, input } = opt;
			const { server } = ctx;
			const config = Config.getEnv();

			if (input.domain.startsWith("*.") && !input.extension)
				throw createFieldError("input.extension", "Extension is required for a wildcard domain");

			const signupDomains = await server.prisma.signupDomain.findMany();
			if (!signupDomains.some((domain) => domain.domain === input.domain))
				throw createFieldError("input.domain", "The provided domain does not exist on the server");

			// Check if invite is enabled and provided input is valid
			if (config.signUpMode === "invite") {
				if (!input.invite) throw createFieldError("input.invite", "An invite is required to create an account");

				const invite = await server.prisma.invites.findFirst({ where: { invite: input.invite } });
				if (!invite) throw createFieldError("input.invite", "The provided invite is invalid");
			}

			if (!server.auth.authReset.has(input.key)) throw createFieldError("input.key", "Invalid MFA key provided, please refresh the page");

			const authData = server.auth.authReset.get(input.key)!;
			const authRes = Auth.verify2FASecret(authData.token, input.auth);
			if (!authRes || authRes.delta !== 0) throw createFieldError("input.auth", "Invalid MFA code provided");

			const domain = input.extension ? `${input.extension}.${input.domain.replace("*.", "")}` : input.domain;
			const backupCodes = Auth.generateBackupCodes();

			try {
				await server.domains.create({
					domain,
					disabled: false,
					twoFactorSecret: authData.token,
					backupCodes: backupCodes.join(","),
					auditlogDuration: ms(config.auditLogDuration),
					extensionsList: config.extensionsList.join(","),
					extensionsMode: config.extensionsMode,
					maxStorage: Utils.parseStorage(config.maxStorage),
					maxUploadSize: Utils.parseStorage(config.maxUpload)
				});

				clearTimeout(authData.timeout);
				server.auth.authReset.delete(input.key);

				if (input.invite) await server.prisma.invites.delete({ where: { invite: input.invite } });
				if (!input.domain.startsWith("*.")) await server.prisma.signupDomain.delete({ where: { domain: input.domain } });

				return backupCodes;
			} catch (err) {
				server.logger.error(`Error occurred while creating a new domain: `, err);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Unknown error occurred while creating a new user, please try again later."
				});
			}
		}),
	createPassword: publicProcedure
		.input(
			z.object({
				extension: z.string().optional(),
				invite: z.string().optional(),
				domain: z.string({ required_error: "A valid domain is required" }),
				password: z.string({ required_error: "A password is required" })
			})
		)
		.mutation(async (opt) => {
			const { ctx, input } = opt;
			const { server } = ctx;
			const config = Config.getEnv();

			if (input.domain.startsWith("*.") && !input.extension)
				throw createFieldError("input.extension", "Extension is required for a wildcard domain");

			const signupDomains = await server.prisma.signupDomain.findMany();
			if (!signupDomains.some((domain) => domain.domain === input.domain))
				throw createFieldError("input.domain", "The provided domain does not exist on the server");

			// Check if invite is enabled and provided input is valid
			if (config.signUpMode === "invite") {
				if (!input.invite) throw createFieldError("input.invite", "An invite is required to create an account");

				const invite = await server.prisma.invites.findFirst({ where: { invite: input.invite } });
				if (!invite) throw createFieldError("input.invite", "The provided invite is invalid");
			}

			const domain = input.extension ? `${input.extension}.${input.domain.replace("*.", "")}` : input.domain;
			const backupCodes = Auth.generateBackupCodes();
			const hashed = Auth.encryptPassword(input.password, config.encryptionKey);

			try {
				await server.domains.create({
					domain,
					disabled: false,
					password: hashed,
					backupCodes: backupCodes.join(","),
					auditlogDuration: ms(config.auditLogDuration),
					extensionsList: config.extensionsList.join(","),
					extensionsMode: config.extensionsMode,
					maxStorage: Utils.parseStorage(config.maxStorage),
					maxUploadSize: Utils.parseStorage(config.maxUpload)
				});

				if (input.invite) await server.prisma.invites.delete({ where: { invite: input.invite } });
				if (!input.domain.startsWith("*.")) await server.prisma.signupDomain.delete({ where: { domain: input.domain } });

				return backupCodes;
			} catch (err) {
				server.logger.error(`Error occurred while creating a new domain: `, err);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Unknown error occurred while creating a new user, please try again later."
				});
			}
		})
});

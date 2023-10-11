import Config from "#lib/Config.js";
import { AuthAdminProdeduce } from "#trpc/context/AuthAdmin.js";
import { t } from "#trpc/lib.js";
import { TRPCError } from "@trpc/server";
import _ from "lodash";
import ms from "ms";
import { z } from "zod";

export const AdminSettingsRoute = t.router({
	/** returns the authentication mode */
	authMode: AuthAdminProdeduce.query(() => {
		const config = Config.getEnv();
		return config.authMode;
	}),
	/** Updates the authentication mode */
	updateAuthMode: AuthAdminProdeduce.input(
		z.union([z.literal("2fa"), z.literal("password")], { required_error: "A valid authentication mode is required" })
	).mutation(async (opt) => {
		const { server } = opt.ctx;
		const config = Config.getEnv();
		await Config.updateEnv({ ...config, authMode: opt.input });

		await server.domains.resetAuth();
	}),
	/** Returns the current settings */
	get: AuthAdminProdeduce.query(async (opt) => {
		const domains = await opt.ctx.server.prisma.signupDomain.findMany();
		const config = Config.getEnv();

		return {
			defaults: {
				authMode: config.authMode,
				signUpMode: config.signUpMode,
				extensions: config.extensionsList,
				extensionsMode: config.extensionsMode,
				maxStorage: config.maxStorage,
				maxUploadSize: config.maxUpload,
				auditlog: config.auditLogDuration
			},
			domains
		};
	}),
	/** Updates the paperplane settings */
	update: AuthAdminProdeduce.input(
		z.object({
			extensionsMode: z.union([z.literal("block"), z.literal("pass")], { required_error: "A valid extensionMode is required" }),
			extensions: z.array(
				z
					.string()
					.startsWith(".", "The extension has to start with a dot (.)")
					.refine((arg) => !arg.endsWith("."), { message: "Extension cannot end with ." }),
				{ required_error: "A valid list of extensions is required" }
			),
			signUpMode: z.union([z.literal("open"), z.literal("closed"), z.literal("invite")], { required_error: "A valid signup mode is required" }),
			auditlog: z
				.string({ required_error: "A valid auditlog duration is required" })
				.refine((arg) => !isNaN(ms(arg)), { message: "Invalid auditlog duration provided" }),
			uploadSize: z.string({ required_error: "Valid upload size is required" }),
			storage: z.string({ required_error: "Valid storage size is required" })
		})
	).mutation(async (opt) => {
		const { server } = opt.ctx;
		const config = Config.getEnv();

		try {
			await Config.updateEnv({ ...config, ...opt.input });
		} catch (err) {
			server.logger.fatal(`[SETTINGS:UPDATE]: Fatal error while updating the settings `, err);
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Unknown error occurred while updating the settings, please try again later."
			});
		}
	}),
	/** Reset the encryption key */
	reset: AuthAdminProdeduce.mutation(async (opt) => {
		const { server } = opt.ctx;

		try {
			await server.config.resetEncryptionKey();
		} catch (err) {
			server.logger.fatal(`[SETTINGS:RESET]: Fatal error while resetting the encryption `, err);
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Unknown error occurred while resetting the encryption, please try again later."
			});
		}
	})
});

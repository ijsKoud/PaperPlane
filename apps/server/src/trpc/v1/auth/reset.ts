import { Auth } from "#lib/Auth.js";
import Config from "#lib/Config.js";
import { AuthUserProdeduce } from "#trpc/context/AuthUser.js";
import { createFieldError, t } from "#trpc/lib.js";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const ResetAuthRoute = t.router({
	/** Returns the generated MFA key data if this mode is enabled */
	mfa: AuthUserProdeduce.query((opt) => {
		const config = Config.getEnv();
		if (config.authMode !== "2fa") return null;

		const auth = opt.ctx.server.auth.generateAuthReset(opt.ctx.domain.domain);
		return auth;
	}),
	/** Reset route for authmode="mfa" */
	resetMfa: AuthUserProdeduce.input(
		z.object({
			key: z.string({ required_error: "Missing a MFA key, please refresh the page" }),
			auth: z
				.string({ required_error: "A 6 digit two factor authentication code is required" })
				.length(6, { message: "The code should be 6 digits long" })
		})
	).mutation(async (opt) => {
		const { ctx, input } = opt;
		const { server, domain } = ctx;
		const config = Config.getEnv();
		if (config.authMode !== "2fa")
			throw new TRPCError({
				code: "PRECONDITION_FAILED",
				message: "Authentication mode is set to 'password', this route is inaccessible."
			});

		const authData = server.auth.authReset.get(input.key);
		if (!authData) throw createFieldError("input_hidden.key", "Missing MFA key, please refresh the page");

		const authRes = Auth.verify2FASecret(authData.token, input.auth);
		if (!authRes || authRes.delta !== 0) throw createFieldError("input.auth", "Invalid MFA code provided");

		const backupCodes = Auth.generateBackupCodes();
		await domain.update({ twoFactorSecret: authData.token, backupCodes: backupCodes.join(",") });

		// Removes the MFA data from the cache
		clearTimeout(authData.timeout);
		server.auth.authReset.delete(input.key);

		return backupCodes;
	}),
	/** Reset route for authmode="password" */
	resetPassword: AuthUserProdeduce.input(
		z.object({
			password: z.string({ required_error: "A password is required" })
		})
	).mutation(async (opt) => {
		const { ctx, input } = opt;
		const { domain } = ctx;
		const config = Config.getEnv();
		if (config.authMode !== "password")
			throw new TRPCError({
				code: "PRECONDITION_FAILED",
				message: "Authentication mode is set to '2fa', this route is inaccessible."
			});

		const backupCodes = Auth.generateBackupCodes();
		const hashed = Auth.encryptPassword(input.password, config.encryptionKey);

		await domain.update({ password: hashed, backupCodes: backupCodes.join(",") });

		return backupCodes;
	})
});

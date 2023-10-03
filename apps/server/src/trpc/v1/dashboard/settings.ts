import { AuthUserProdeduce } from "#trpc/context/AuthUser.js";
import { t } from "#trpc/lib.js";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const settingsRoute = t.router({
	/** Returns the domain settings */
	get: AuthUserProdeduce.query((opt) => {
		const { domain } = opt.ctx;
		return {
			tokens: domain.apiTokens.map((token) => ({ name: token.name, date: token.date })),
			nameLength: domain.nameLength,
			nameStrategy: domain.nameStrategy,
			embedEnabled: domain.embedEnabled,
			embed: {
				title: domain.embedTitle,
				description: domain.embedDescription,
				color: domain.embedColor
			}
		};
	}),
	/** Updates the user settings */
	update: AuthUserProdeduce.input(
		z.object({
			embedEnabled: z.boolean(),
			nameLength: z.number({ required_error: "A valid name length is required" }).min(4, "The minimum length is 4 characters long"),
			nameStrategy: z.union([z.literal("name"), z.literal("id"), z.literal("zerowidth")], {
				required_error: "A valid name strategy must be selected",
				invalid_type_error: "The provided strategy does not exist"
			})
		})
	).mutation(async (opt) => {
		const { domain, server } = opt.ctx;

		try {
			await domain.update(opt.input, false);
			domain.auditlogs.register(
				"Settings Update",
				`Length: ${opt.input.nameLength}, strategy: ${opt.input.nameStrategy}, embedEnabled: ${opt.input.embedEnabled}`
			);
		} catch (err) {
			server.logger.fatal("[SETTINGS:UPDATE]: Fatal error while updating the user settings", err);
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Unknown error occurred, please try again later."
			});
		}
	}),
	/** resets the user */
	reset: AuthUserProdeduce.mutation(async (opt) => {
		const { domain, server } = opt.ctx;

		try {
			await domain.reset();
		} catch (err) {
			server.logger.fatal("[SETTINGS:RESET]: Fatal error while resetting the user", err);
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Unknown error occurred, please try again later."
			});
		}
	}),
	/** Updates the user embed settings (OG METADATA) */
	updateEmbed: AuthUserProdeduce.input(
		z.object({
			description: z.string().optional(),
			title: z.string({ required_error: "A title is required" }),
			color: z.string({ required_error: "A color is required" }).regex(/\#[0-9A-Fa-f]{6}/g, "Invalid color provided")
		})
	).mutation(async (opt) => {
		const { description, title, color } = opt.input;
		const { domain, server } = opt.ctx;

		try {
			await domain.update({ embedTitle: title, embedDescription: description, embedColor: color });
			domain.auditlogs.register("Embed Update", "N/A");
		} catch (err) {
			server.logger.fatal("[SETTINGS:EMBEDUPDATE]: Fatal error while updating the user embed settings", err);
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Unknown error occurred, please try again later."
			});
		}
	}),
	/** Deletes a list of tokens */
	deleteTokens: AuthUserProdeduce.input(z.array(z.string(), { required_error: "A valid array of token names is required" })).mutation(
		async (opt) => {
			const tokens = opt.input;
			const { domain, server } = opt.ctx;

			try {
				await domain.deleteTokens(tokens);
				domain.auditlogs.register("Token Deleted", `Tokens: ${tokens.join(",")}`);
			} catch (err) {
				server.logger.fatal("[SETTINGS:DELETETOKEN]: Fatal error while deleting tokens", err);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Unknown error occurred, please try again later."
				});
			}
		}
	),
	/** Creates a new API token */
	createToken: AuthUserProdeduce.input(z.string({ required_error: "A valid name for the token is required" })).mutation(async (opt) => {
		const name = opt.input;
		const { domain, server } = opt.ctx;

		try {
			if (domain.apiTokens.find((token) => token.name === name))
				throw new TRPCError({ code: "CONFLICT", message: "A token with the provided name already exists" });

			const token = await domain.createToken(name);
			domain.auditlogs.register("Token Created", `Name: ${name}`);
			return token.token;
		} catch (err) {
			server.logger.fatal("[SETTINGS:CREATETOKEN]: Fatal error while creating a token", err);
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Unknown error occurred, please try again later."
			});
		}
	})
});

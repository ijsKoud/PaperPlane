import { AuthAdminProdeduce } from "#trpc/context/AuthAdmin.js";
import { t } from "#trpc/lib.js";
import { TRPCError } from "@trpc/server";
import _ from "lodash";
import { z } from "zod";

export const AdminInvitesRoute = t.router({
	/** Return list of invites */
	list: AuthAdminProdeduce.input(z.number({ required_error: "A valid page number is required" })).query((opt) => {
		const { server } = opt.ctx;
		const page = opt.input;
		const { invites } = server.domains;

		const chunks = _.chunk(invites, 50);
		const chunk = page > chunks.length ? chunks[chunks.length - 1] : chunks[page];
		return {
			entries: (chunk ?? []).map((invite) => ({ ...invite, date: invite.Date })),
			pages: chunks.length
		};
	}),
	/** Create new invite */
	create: AuthAdminProdeduce.mutation(async (opt) => {
		const { server } = opt.ctx;

		try {
			const invite = await server.domains.createInvite();
			return invite;
		} catch (error) {
			server.logger.fatal(`[INVITE:CREATE]: Fatal error while creating an invite `, error);
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Unknown error occurred while creating an invite, please try again later."
			});
		}
	}),
	/** Deletes invites */
	delete: AuthAdminProdeduce.input(z.array(z.string({ required_error: "A valid invite is required" }))).mutation(async (opt) => {
		const { server } = opt.ctx;
		const invites = opt.input;

		try {
			for await (const invite of invites) {
				await server.domains.deleteInvite(invite);
			}
		} catch (error) {
			server.logger.fatal(`[INVITE:DELETE]: Fatal error while deleting invites `, error);
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Unknown error occurred while deleting invites, please try again later."
			});
		}
	})
});

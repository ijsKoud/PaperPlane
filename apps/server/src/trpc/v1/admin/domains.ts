import { AuthAdminProdeduce } from "#trpc/context/AuthAdmin.js";
import { AuthUserProdeduce } from "#trpc/context/AuthUser.js";
import { t } from "#trpc/lib.js";
import { TRPCError } from "@trpc/server";
import _ from "lodash";
import { z } from "zod";

export const AdminDomainsRoute = t.router({
	/** Return list of signup domains */
	list: AuthAdminProdeduce.input(z.number({ required_error: "A valid page number is required" })).query(async (opt) => {
		const { server } = opt.ctx;
		const page = opt.input;
		const domains = await server.prisma.signupDomain.findMany();

		const chunks = _.chunk(domains, 50);
		const chunk = page > chunks.length ? chunks[chunks.length - 1] : chunks[page];
		return {
			entries: chunk.map((domain) => ({ ...domain, date: domain.Date })),
			pages: chunks.length
		};
	}),
	/** Create new signup domain */
	create: AuthUserProdeduce.input(
		z
			.string({ required_error: "A valid domain is required" })
			.refine((arg) => !arg.startsWith(".") && !arg.endsWith(".") && !arg.startsWith("-"), { message: "Invalid domain provided" })
	).mutation(async (opt) => {
		const { server } = opt.ctx;
		const domain = opt.input;

		try {
			await server.prisma.signupDomain.create({ data: { domain } });
			server.adminAuditLogs.register("SignUp Domain Create", `Domain: ${domain}`);
		} catch (error) {
			server.logger.fatal(`[DOMAINS:CREATE]: Fatal error while adding a signup domain `, error);
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Unknown error occurred while adding a signup domain, please try again later."
			});
		}
	}),
	/** Deletes signup domains */
	delete: AuthUserProdeduce.input(z.array(z.string({ required_error: "A valid domain is required" }))).mutation(async (opt) => {
		const { server } = opt.ctx;
		const domains = opt.input;

		try {
			await server.prisma.signupDomain.deleteMany({ where: { domain: { in: domains } } });
			server.adminAuditLogs.register("SignUp Domain Delete", `Domains: ${domains.join(", ")}`);
		} catch (error) {
			server.logger.fatal(`[DOMAINS:DELETE]: Fatal error while deleting signup domains `, error);
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Unknown error occurred while deleting signup domains, please try again later."
			});
		}
	})
});

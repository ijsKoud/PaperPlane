import Config from "#lib/Config.js";
import FuzzySearch from "#lib/FuzzySearch.js";
import { STORAGE_UNITS, TIME_UNITS_ARRAY } from "#lib/constants.js";
import { AdminUserSort } from "#lib/types.js";
import { Utils } from "#lib/utils.js";
import { AuthAdminProdeduce } from "#trpc/context/AuthAdmin.js";
import { createFieldError, t } from "#trpc/lib.js";
import { TRPCError } from "@trpc/server";
import _ from "lodash";
import { z } from "zod";

export const AdminUsersRoute = t.router({
	/** Return list of users */
	list: AuthAdminProdeduce.input(
		z.object({
			page: z.number({ required_error: "A valid page number is required" }),
			query: z.string().optional().default(""),
			sort: z.nativeEnum(AdminUserSort).optional().default(AdminUserSort.DATE_NEW_OLD)
		})
	).query((opt) => {
		const { server } = opt.ctx;
		const { page, query, sort } = opt.input;

		const users = server.domains.getAll(true);
		const fuzzySearch = new FuzzySearch(users, { keys: ["domain"] });
		const results = fuzzySearch.search(query);

		const sorted = Utils.userSort(results, sort);
		const chunks = _.chunk(sorted, 50);
		const chunk = page > chunks.length ? chunks[chunks.length - 1] : chunks[page];
		return {
			entries: (chunk ?? []).map((domain) => domain.toJSON().parsed),
			pages: chunks.length
		};
	}),
	/** Deletes an user */
	delete: AuthAdminProdeduce.input(z.array(z.string({ required_error: "A valid domain name is required" }))).mutation(async (opt) => {
		const domains = opt.input;
		const { server } = opt.ctx;

		try {
			await server.domains.delete(domains);
		} catch (err) {
			server.logger.fatal(`[USERS:DELETE]: Fatal error while deleting users `, err);
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Unknown error occurred while deleting users, please try again later."
			});
		}
	}),
	/** Resets the authentication of an user */
	resetAuth: AuthAdminProdeduce.input(z.string({ required_error: "A valid domain name is required" })).mutation(async (opt) => {
		const name = opt.input;
		const { server } = opt.ctx;

		const domain = server.domains.get(name);
		if (!domain) throw new TRPCError({ code: "NOT_FOUND", message: "The provided user does not exist" });

		try {
			await domain.resetAuth();
		} catch (err) {
			server.logger.fatal(`[USERS:RESETAUTH]: Fatal error while resetting authentication of an user `, err);
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Unknown error occurred while resetting authentication of an user, please try again later."
			});
		}
	}),
	/** Returns the default creation options */
	getDefault: AuthAdminProdeduce.query(async (opt) => {
		const { server } = opt.ctx;
		const config = Config.getEnv();
		const domains = await server.prisma.signupDomain.findMany();

		return {
			defaults: {
				extensions: config.extensionsList,
				extensionsMode: config.extensionsMode,
				maxStorage: config.maxStorage,
				maxUploadSize: config.maxUpload,
				auditlog: config.auditLogDuration
			},
			domains: domains.map((domain) => domain.domain)
		};
	}),
	/** Creates new user */
	create: AuthAdminProdeduce.input(
		z.object({
			storage: z.number({ required_error: "A max storage is required" }).min(0, "Storage cannot be below 0 K.B"),
			storageUnit: z.string().refine((arg) => STORAGE_UNITS.includes(arg as any), "The provided unit is not valid"),
			uploadSize: z.number({ required_error: "An upload size is required" }).min(0, "Upload size cannot be below 0 K.B"),
			uploadSizeUnit: z.string().refine((arg) => STORAGE_UNITS.includes(arg as any), "The provided unit is not valid"),
			extensions: z.array(z.string()),
			extensionsMode: z.union([z.literal("pass"), z.literal("block")], {
				invalid_type_error: "The provided mode is not valid",
				required_error: "An extension mode is required"
			}),
			auditlog: z.number({ required_error: "An auditlog duration is required" }).min(0, "Auditlog duration cannot be below 0 seconds"),
			auditlogUnit: z.string().refine((arg) => TIME_UNITS_ARRAY.includes(arg as any), "The provided unit is not valid"),
			domain: z.string({ required_error: "The domain is a required option" }),
			extension: z.string()
		})
	).mutation(async (opt) => {
		const { server } = opt.ctx;
		if (opt.input.domain.startsWith("*.") && !opt.input.extension.length) throw createFieldError("input.extension", "No sub-domain provided");

		opt.input.extensions = opt.input.extensions.filter((ext) => ext.startsWith(".") && !ext.endsWith("."));
		const domain = opt.input.domain.startsWith("*.") ? `${opt.input.extension}.${opt.input.domain.replace("*.", "")}` : opt.input.domain;

		try {
			await server.domains.create({
				disabled: false,
				domain,
				extensionsList: opt.input.extensions.join(","),
				extensionsMode: opt.input.extensionsMode,
				maxStorage: `${opt.input.storage} ${opt.input.storageUnit}`,
				maxUploadSize: `${opt.input.uploadSize} ${opt.input.uploadSizeUnit}`,
				auditlogDuration: `${opt.input.auditlog}${opt.input.auditlogUnit}`
			});

			if (!opt.input.domain.startsWith("*.")) {
				await server.prisma.signupDomain.delete({ where: { domain: opt.input.domain } });
			}

			server.adminAuditLogs.register("Create User", `User: ${opt.input.domain} (${server.domains.get(domain)!.filesPath})`);
		} catch (err) {
			server.logger.fatal(`[USERS:CREATE]: Fatal error while creating a new user `, err);
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Unknown error occurred while creating a new user, please try again later."
			});
		}
	}),
	/** updates new user */
	update: AuthAdminProdeduce.input(
		z.object({
			disabled: z.boolean(),
			storage: z.number({ required_error: "A max storage is required" }).min(0, "Storage cannot be below 0 K.B"),
			storageUnit: z.string().refine((arg) => STORAGE_UNITS.includes(arg as any), "The provided unit is not valid"),
			uploadSize: z.number({ required_error: "An upload size is required" }).min(0, "Upload size cannot be below 0 K.B"),
			uploadSizeUnit: z.string().refine((arg) => STORAGE_UNITS.includes(arg as any), "The provided unit is not valid"),
			extensions: z.array(z.string()),
			extensionsMode: z.union([z.literal("pass"), z.literal("block")], {
				invalid_type_error: "The provided mode is not valid",
				required_error: "An extension mode is required"
			}),
			auditlog: z.number({ required_error: "An auditlog duration is required" }).min(0, "Auditlog duration cannot be below 0 seconds"),
			auditlogUnit: z.string().refine((arg) => TIME_UNITS_ARRAY.includes(arg as any), "The provided unit is not valid"),
			domains: z.array(z.string(), { required_error: "The array of domains is a required option" })
		})
	).mutation(async (opt) => {
		const { server } = opt.ctx;

		opt.input.extensions = opt.input.extensions.filter((ext) => ext.startsWith(".") && !ext.endsWith("."));

		try {
			await server.domains.update(opt.input.domains, {
				disabled: opt.input.disabled,
				extensionsList: opt.input.extensions.join(","),
				extensionsMode: opt.input.extensionsMode,
				maxStorage: `${opt.input.storage} ${opt.input.storageUnit}`,
				maxUploadSize: `${opt.input.uploadSize} ${opt.input.uploadSizeUnit}`,
				auditlogDuration: `${opt.input.auditlog}${opt.input.auditlogUnit}`
			});
		} catch (err) {
			server.logger.fatal(`[USERS:CREATE]: Fatal error while updating users `, err);
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Unknown error occurred while updating users, please try again later."
			});
		}
	})
});

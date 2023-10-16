import { AuthUserProdeduce } from "#trpc/context/AuthUser.js";
import { t } from "#trpc/lib.js";
import { z } from "zod";
import _ from "lodash";
import FuzzySearch from "#lib/FuzzySearch.js";
import { Utils } from "#lib/utils.js";
import { TRPCError } from "@trpc/server";
import { UrlsSort } from "#lib/types.js";

export const urlRoute = t.router({
	/** Returns the shorturls of the user */
	list: AuthUserProdeduce.input(
		z.object({
			query: z.string().optional(),
			page: z.number().optional().default(0),
			sort: z.nativeEnum(UrlsSort).optional().default(UrlsSort.DATE_NEW_OLD)
		})
	).query(async (opt) => {
		const { query, page, sort } = opt.input;
		const { domain, server } = opt.ctx;

		let entries = await server.prisma.url.findMany({ where: { domain: domain.domain } });

		const fuzzySearch = new FuzzySearch(entries, { keys: ["url", "id"] });
		entries = fuzzySearch.search(query ?? "").sort((a, b) => b.date.getTime() - a.date.getTime());

		const sorted = Utils.urlSort(entries, sort);
		const chunks = _.chunk(sorted, 50);
		const chunk = (page > chunks.length ? chunks[chunks.length - 1] : chunks[page]) ?? [];

		const mapped = chunk.map((url) => ({
			name: url.id,
			date: url.date,
			visits: url.visits,
			visible: url.visible,
			redirect: url.url,
			url: `${Utils.getProtocol()}${domain}/r/${url.id}`
		}));

		return {
			entries: mapped,
			pages: chunks.length
		};
	}),
	/** Creates a new shorturl */
	create: AuthUserProdeduce.input(
		z.object({
			url: z.string({ required_error: "url is a required parameter" }).url("The provided url is invalid"),
			name: z
				.string()
				.refine((arg) => !arg.includes("/"))
				.optional(),
			visible: z.boolean()
		})
	).mutation(async (opt) => {
		const { url, name, visible } = opt.input;
		const { server, domain } = opt.ctx;

		const links = await server.prisma.url.findMany({ where: { domain: domain.domain } });
		const strategy = domain.nameStrategy === "name" ? "id" : domain.nameStrategy;
		let path = typeof name === "string" ? name : "";

		// Generate a random ID that does not exist
		if (!path.length || links.find((link) => link.id === path)) {
			path = Utils.generateId(strategy, domain.nameLength) as string;
			while (links.find((link) => link.id === path)) path = Utils.generateId(strategy, domain.nameLength) as string;
		}

		try {
			await server.prisma.url.create({ data: { date: new Date(), url, id: path, visible, domain: domain.domain } });
			return `${Utils.getProtocol()}${domain.domain}/r/${path}`;
		} catch (err) {
			server.logger.fatal("[URL:CREATE]: Fatal error while uploading a shorturl", err);
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Unknown error occurred while creating a new shorturl, please try again later."
			});
		}
	}),
	/** Updates a shorturl */
	update: AuthUserProdeduce.input(
		z.object({
			id: z.string({ required_error: "The name of the url is required" }),
			name: z
				.string({ required_error: "A name for the url is required" })
				.refine((arg) => !arg.includes("/"), { message: "The name cannot contain a slash (/)" }),
			visible: z.boolean()
		})
	).mutation(async (opt) => {
		const { id, name, visible } = opt.input;
		const { server, domain } = opt.ctx;

		const links = await server.prisma.url.findMany({ where: { domain: domain.domain } });

		try {
			await server.prisma.url.update({
				where: { id_domain: { domain: domain.domain, id } },
				data: {
					visible,
					id: links.map((url) => url.id).includes(name) ? undefined : name
				}
			});
		} catch (err) {
			server.logger.fatal("[URL:UPDATE]: Fatal error while updating a shorturl", err);
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Unknown error occurred while updating a shorturl, please try again later."
			});
		}
	}),
	/** Deletes a list of shorturls */
	delete: AuthUserProdeduce.input(z.array(z.string(), { required_error: "An array of url ids is required" })).mutation(async (opt) => {
		const urls = opt.input;
		const { server, domain } = opt.ctx;

		try {
			await server.prisma.url.deleteMany({ where: { id: { in: urls }, domain: domain.domain } });
		} catch (err) {
			server.logger.fatal("[URL:DELETE]: Fatal error while deleting shorturls", err);
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Unknown error occurred while deleting shorturls, please try again later."
			});
		}
	})
});

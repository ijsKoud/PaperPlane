import { AuthUserProdeduce } from "#trpc/context/AuthUser.js";
import { t } from "#trpc/lib.js";
import { z } from "zod";
import _ from "lodash";
import FuzzySearch from "#lib/FuzzySearch.js";
import { urlRoute } from "./url.js";
import { filesRoute } from "./files.js";

export const dashboardRoute = t.router({
	/** Returns the user stats (storage usage, amount of files, etc) */
	stats: AuthUserProdeduce.query(async (opt) => {
		const { domain, server } = opt.ctx;

		const files = await server.prisma.file.count({ where: { domain: domain.domain } });
		const shorturls = await server.prisma.url.count({ where: { domain: domain.domain } });
		const pastebins = await server.prisma.pastebin.count({ where: { domain: domain.domain } });

		const parsedDomainData = domain.toJSON().raw;
		return {
			files,
			shorturls,
			pastebins,
			storage: {
				total: parsedDomainData.maxStorage,
				used: parsedDomainData.storage
			}
		};
	}),
	/** Returns the audit logs from the user */
	audit: AuthUserProdeduce.input(
		z.object({
			query: z.string().optional(),
			page: z.number().optional().default(0)
		})
	).query((opt) => {
		const { query, page } = opt.input;
		const { domain } = opt.ctx;

		let entries = domain.auditlogs.logs.map((log) => _.pick(log, ["date", "details", "type"]));

		const fuzzySearch = new FuzzySearch(entries, { keys: ["type", "details"] });
		entries = fuzzySearch.search(query ?? "").sort((a, b) => b.date.getTime() - a.date.getTime());

		const chunks = _.chunk(entries, 50);
		const chunk = page > chunks.length ? chunks[chunks.length - 1] : chunks[page];

		return {
			entries: chunk ?? [],
			pages: chunks.length
		};
	}),
	url: urlRoute,
	files: filesRoute
});

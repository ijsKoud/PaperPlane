import Config from "#lib/Config.js";
import FuzzySearch from "#lib/FuzzySearch.js";
import { AuthAdminProdeduce } from "#trpc/context/AuthAdmin.js";
import { t } from "#trpc/lib.js";
import _ from "lodash";
import { z } from "zod";
import { AdminSettingsRoute } from "./settings.js";
import { AdminDomainsRoute } from "./domains.js";
import { AdminInvitesRoute } from "./invites.js";
import { AdminBackupsRoute } from "./backups.js";

export const AdminRoute = t.router({
	/** returns the computer usage and other useful information */
	service: AuthAdminProdeduce.query((opt) => {
		const config = Config.getEnv();
		const { server } = opt.ctx;
		const stats = server.stats.toJSON();

		return { authMode: config.authMode, signUpMode: config.signUpMode, users: server.domains.domains.size, ...stats.formatted };
	}),
	/** Returns the audit logs from the user */
	audit: AuthAdminProdeduce.input(
		z.object({
			query: z.string().optional(),
			page: z.number().optional().default(0)
		})
	).query((opt) => {
		const { query, page } = opt.input;
		const { server } = opt.ctx;

		let entries = server.adminAuditLogs.logs.map((log) => _.pick(log, ["date", "details", "type"]));

		const fuzzySearch = new FuzzySearch(entries, { keys: ["type", "details"] });
		entries = fuzzySearch.search(query ?? "").sort((a, b) => b.date.getTime() - a.date.getTime());

		const chunks = _.chunk(entries, 50);
		const chunk = page > chunks.length ? chunks[chunks.length - 1] : chunks[page];

		return {
			entries: chunk ?? [],
			pages: chunks.length
		};
	}),
	settings: AdminSettingsRoute,
	domains: AdminDomainsRoute,
	invite: AdminInvitesRoute,
	backup: AdminBackupsRoute
});

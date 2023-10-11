import { AuthAdminProdeduce } from "#trpc/context/AuthAdmin.js";
import { AuthUserProdeduce } from "#trpc/context/AuthUser.js";
import { t } from "#trpc/lib.js";
import { TRPCError } from "@trpc/server";
import _ from "lodash";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";

export const AdminBackupsRoute = t.router({
	/** Return list of backups */
	list: AuthAdminProdeduce.input(z.number({ required_error: "A valid page number is required" })).query(async (opt) => {
		const { server } = opt.ctx;
		const page = opt.input;

		const backups = await readdir(join(server.backups.backupDirectory, "archives"));
		const chunks = _.chunk(backups, 50);
		const chunk = page > chunks.length ? chunks[chunks.length - 1] : chunks[page];
		return {
			entries: (chunk ?? []).map((backup) => backup.replace(".zip", "")),
			pages: chunks.length,
			importInProgress: server.backups.backupImportInProgress,
			createInProgress: server.backups.backupCreateInProgress
		};
	}),
	/** Create new backup */
	create: AuthUserProdeduce.mutation((opt) => {
		const { server } = opt.ctx;

		if (Boolean(server.backups.backupImportInProgress))
			throw new TRPCError({ code: "FORBIDDEN", message: "A backup is already being imported." });
		if (server.backups.backupCreateInProgress) throw new TRPCError({ code: "FORBIDDEN", message: "A backup is already being created." });

		void server.backups.createBackup();
	}),
	/** Deletes backup */
	import: AuthUserProdeduce.input(z.string({ required_error: "A valid backup name is required" })).mutation((opt) => {
		const { server } = opt.ctx;
		const backup = opt.input;

		if (Boolean(server.backups.backupImportInProgress))
			throw new TRPCError({ code: "FORBIDDEN", message: "A backup is already being imported." });
		if (server.backups.backupCreateInProgress) throw new TRPCError({ code: "FORBIDDEN", message: "A backup is already being created." });

		void server.backups.import(backup).catch((err) => {
			server.logger.fatal(`[BACKUP:IMPORT]: Fatal error while importing `, err);
		});
	})
});

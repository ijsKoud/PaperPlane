import { AuthUserProdeduce } from "#trpc/context/AuthUser.js";
import { t } from "#trpc/lib.js";
import { z } from "zod";
import _ from "lodash";
import FuzzySearch from "#lib/FuzzySearch.js";
import { Utils } from "#lib/utils.js";
import { TRPCError } from "@trpc/server";
import { FilesSort } from "#lib/types.js";
import { lookup } from "mime-types";
import { Auth } from "#lib/Auth.js";
import Config from "#lib/Config.js";

export const filesRoute = t.router({
	/** Returns the files of the user */
	list: AuthUserProdeduce.input(
		z.object({
			query: z.string().optional(),
			page: z.number().optional().default(0),
			sort: z.nativeEnum(FilesSort).optional().default(FilesSort.DATE_NEW_OLD)
		})
	).query(async (opt) => {
		const { query, page, sort } = opt.input;
		const { domain, server, req } = opt.ctx;

		let entries = await server.prisma.file.findMany({ where: { domain: domain.domain } });

		const fuzzySearch = new FuzzySearch(entries, { keys: ["id", "mimeType", "size"] });
		entries = fuzzySearch.search(query ?? "").sort((a, b) => b.date.getTime() - a.date.getTime());

		const sorted = Utils.filesSort(entries, sort);
		const chunks = _.chunk(sorted, 50);
		const chunk = (page > chunks.length ? chunks[chunks.length - 1] : chunks[page]) ?? [];

		const mapped = chunk.map((file) => ({
			name: file.id,
			date: file.date,
			isImage: (file.mimeType || lookup(file.path) || "").includes("image"),
			password: Boolean(file.password),
			size: file.size,
			views: file.views,
			visible: file.visible,
			ext: Utils.getExtension(file.mimeType || lookup(file.path) || "") || "",
			url: `${req.protocol}://${domain}/files/${file.id}`
		}));

		return {
			entries: mapped,
			pages: chunks.length
		};
	}),
	/** Updates a file */
	update: AuthUserProdeduce.input(
		z.object({
			id: z.string({ required_error: "The id of the file is required" }),
			name: z
				.string({ required_error: "A name for the file is required" })
				.refine((arg) => !arg.includes("/"), { message: "The name cannot contain a slash (/)" }),
			visible: z.boolean(),
			passwordEnabled: z.boolean(),
			password: z.string().optional()
		})
	).mutation(async (opt) => {
		const { id, name, visible, passwordEnabled, password } = opt.input;
		const { server, domain } = opt.ctx;
		const config = Config.getEnv();

		const files = await server.prisma.file.findMany({ where: { domain: domain.domain } });

		try {
			await server.prisma.file.update({
				where: { id_domain: { domain: domain.domain, id } },
				data: {
					visible,
					id: files.map((file) => file.id).includes(name) ? undefined : name,
					password: password ? Auth.encryptPassword(password, config.encryptionKey) : passwordEnabled ? undefined : null // Sets password if provided, removes if passwordEnabled is false
				}
			});
		} catch (err) {
			server.logger.fatal("[FILE:UPDATE]: Fatal error while updating a file", err);
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Unknown error occurred while updating a file, please try again later."
			});
		}
	}),
	/** Deletes a list of files */
	delete: AuthUserProdeduce.input(z.array(z.string(), { required_error: "An array of file ids is required" })).mutation(async (opt) => {
		const files = opt.input;
		const { server, domain } = opt.ctx;

		try {
			await server.prisma.file.deleteMany({ where: { id: { in: files }, domain: domain.domain } });
		} catch (err) {
			server.logger.fatal("[FILE:DELETE]: Fatal error while deleting files", err);
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Unknown error occurred while updating a file, please try again later."
			});
		}
	})
});

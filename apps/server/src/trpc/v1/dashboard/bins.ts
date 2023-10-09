import { AuthUserProdeduce } from "#trpc/context/AuthUser.js";
import { t } from "#trpc/lib.js";
import { z } from "zod";
import _ from "lodash";
import FuzzySearch from "#lib/FuzzySearch.js";
import { Utils } from "#lib/utils.js";
import { TRPCError } from "@trpc/server";
import { BinSort } from "#lib/types.js";
import { Auth } from "#lib/Auth.js";
import Config from "#lib/Config.js";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

export const binsRoute = t.router({
	/** Returns the bins of the user */
	list: AuthUserProdeduce.input(
		z.object({
			query: z.string().optional(),
			page: z.number().optional().default(0),
			sort: z.nativeEnum(BinSort).optional().default(BinSort.DATE_NEW_OLD)
		})
	).query(async (opt) => {
		const { query, page, sort } = opt.input;
		const { domain, server, req } = opt.ctx;

		let entries = await server.prisma.pastebin.findMany({ where: { domain: domain.domain } });

		const fuzzySearch = new FuzzySearch(entries, { keys: ["id", "highlight"] });
		entries = fuzzySearch.search(query ?? "").sort((a, b) => b.date.getTime() - a.date.getTime());

		const sorted = Utils.binSort(entries, sort);
		const chunks = _.chunk(sorted, 50);
		const chunk = (page > chunks.length ? chunks[chunks.length - 1] : chunks[page]) ?? [];

		const mapped = chunk.map((bin) => ({
			name: bin.id,
			date: bin.date,
			password: Boolean(bin.password),
			highlight: bin.highlight,
			views: bin.views,
			visible: bin.visible,
			url: `${req.protocol}://${domain}/bins/${bin.id}`
		}));

		return {
			entries: mapped,
			pages: chunks.length
		};
	}),
	/** Get the pastebin contents */
	details: AuthUserProdeduce.input(z.string({ required_error: "A valid pastebin name is required" })).query(async (opt) => {
		const name = opt.input;
		const { server, domain } = opt.ctx;

		const bin = await server.prisma.pastebin.findUnique({ where: { id_domain: { domain: domain.domain, id: name } } });
		if (!bin) throw new TRPCError({ code: "NOT_FOUND", message: "The requested pastebin does not exist" });

		try {
			const file = await readFile(bin.path, "utf-8");
			return file;
		} catch (err) {
			server.logger.fatal("[BIN:DETAILS]: Fatal error while getting pastebin details", err);
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Unknown error occurred while requesting the pastebin data, please try again later."
			});
		}
	}),
	/** Updates a bin */
	update: AuthUserProdeduce.input(
		z.object({
			id: z.string({ required_error: "The id of the pastebin is required" }),
			name: z.string().optional(),
			visible: z.boolean(),
			passwordEnabled: z.boolean(),
			password: z.string().optional(),
			data: z.string().nonempty("Pastebin content is required"),
			highlight: z.string({ required_error: "A valid highlight type is required" })
		})
	).mutation(async (opt) => {
		const { id, name, visible, passwordEnabled, password, data, highlight } = opt.input;
		const { server, domain } = opt.ctx;

		const config = Config.getEnv();
		const pastebins = await server.prisma.pastebin.findMany({ where: { domain: domain.domain } });

		try {
			const bin = await server.prisma.pastebin.update({
				where: { id_domain: { domain: domain.domain, id } },
				data: {
					id: name ? (pastebins.map((bin) => bin.id).includes(name) ? undefined : name) : undefined, // Set name if unqiue and provided
					password: password ? Auth.encryptPassword(password, config.encryptionKey) : passwordEnabled ? undefined : null, // set password if provided, keep if enabled
					visible,
					highlight
				}
			});

			if (typeof data === "string" && data.length) await writeFile(bin.path, data);
			domain.auditlogs.register("Pastebin Updated", `Id: ${bin.id}`);
		} catch (err) {
			server.logger.fatal("[BIN:UPDATE]: Fatal error while updating a file", err);
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Unknown error occurred while updating a pastebin, please try again later."
			});
		}
	}),
	/** Create a bin */
	create: AuthUserProdeduce.input(
		z.object({
			name: z.string().optional(),
			visible: z.boolean(),
			data: z.string().nonempty("Pastebin content is required"),
			highlight: z.string({ required_error: "A valid highlight type is required" }),
			password: z.string().optional()
		})
	).mutation(async (opt) => {
		const { name, visible, password, data, highlight } = opt.input;
		const { server, domain, req } = opt.ctx;

		const config = Config.getEnv();
		const pastebins = await server.prisma.pastebin.findMany({ where: { domain: domain.domain } });

		try {
			const path = join(domain.pastebinPath, `${Auth.generateToken(32)}.txt`);
			const id = Utils.generateId(domain.nameStrategy, domain.nameLength) || (Utils.generateId("id", domain.nameLength) as string);

			// Authentication stuff
			const authBuffer = Buffer.from(`${Auth.generateToken(32)}.${Date.now()}.${domain.domain}.${id}`).toString("base64");
			const authSecret = Auth.encryptToken(authBuffer, config.encryptionKey);

			await writeFile(path, data);
			await server.prisma.pastebin.create({
				data: {
					id: name ? (pastebins.map((bin) => bin.id).includes(name) ? id : name) : id,
					date: new Date(),
					domain: domain.domain,
					visible,
					path,
					highlight,
					authSecret,
					password: password ? Auth.encryptPassword(password, config.encryptionKey) : undefined
				}
			});

			domain.auditlogs.register("Pastebin Created", `Id: ${id}`);

			return `${req.protocol}://${domain}/bins/${id}`;
		} catch (err) {
			server.logger.fatal("[BIN:CREATE]: Fatal error while deleting files", err);
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Unknown error occurred while creating a pastebin, please try again later."
			});
		}
	}),
	/** Deletes a list of bins */
	delete: AuthUserProdeduce.input(z.array(z.string(), { required_error: "An array of pastebin ids is required" })).mutation(async (opt) => {
		const bins = opt.input;
		const { server, domain } = opt.ctx;

		try {
			await server.prisma.pastebin.deleteMany({ where: { id: { in: bins }, domain: domain.domain } });
		} catch (err) {
			server.logger.fatal("[BIN:DELETE]: Fatal error while deleting pastebins", err);
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Unknown error occurred while deleting the pastebins, please try again later."
			});
		}
	})
});

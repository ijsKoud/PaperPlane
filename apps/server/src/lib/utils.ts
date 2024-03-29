import { randomBytes } from "node:crypto";
import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import ShortUniqueId from "short-unique-id";
import type Domain from "#components/Domain.js";
import { AdminUserSort, BinSort, FilesSort, UrlsSort } from "./types.js";
import type { File, Pastebin, Url } from "@prisma/client";
import { extension } from "mime-types";
import { STORAGE_UNITS } from "./constants.js";
import type { ZodError } from "zod";

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Utils {
	public static chunk<T>(arr: T[], size: number): T[][] {
		const result = [];
		const L = arr.length;
		let i = 0;

		while (i < L) result.push(arr.slice(i, (i += size)));

		return result;
	}

	/** Maps the zod errors */
	public static parseZodError(error: ZodError) {
		return error.errors.map((error) => ({
			field: error.path.map((path) => (typeof path === "number" ? `[${path}]` : `${path}`)).join("."),
			code: error.code.toUpperCase(),
			message: error.message
		}));
	}

	public static getExtension(type: string): string | null {
		const ext = extension(type);
		if (!ext) return null;

		switch (ext) {
			case "mpga":
				return "mp3";
			default:
				return ext;
		}
	}

	public static getProtocol() {
		return process.env.INSECURE_REQUESTS === "true" ? "http://" : "https://";
	}

	public static generateId(strategy: "id" | "zerowidth" | "name", length: number): string | undefined {
		switch (strategy) {
			case "id":
			default: {
				const genId = new ShortUniqueId.default({ length });
				return genId.rnd();
			}
			case "zerowidth": {
				const invisibleCharset = ["\u200B", "\u2060", "\u200C", "\u200D"];
				const id = [...randomBytes(length)]
					.map((byte) => invisibleCharset[Number(byte) % invisibleCharset.length])
					.join("")
					.slice(1)
					.concat(invisibleCharset[0]);
				return id;
			}
			case "name":
				return undefined;
		}
	}

	public static parseStorage(storage: string): number;
	public static parseStorage(storage: number): string;
	public static parseStorage(storage: string | number): number | string {
		if (typeof storage === "string") {
			const INFINITY = STORAGE_UNITS.map((unit) => `0 ${unit}`);
			if (!storage.length || [INFINITY, "0"].includes(storage)) return 0;

			const [_amount, unit] = storage.split(/ +/g);
			const unitSize = STORAGE_UNITS.indexOf(unit as any) || 0;

			const amount = Number(_amount);
			if (isNaN(amount)) return 0;

			return amount * Math.pow(1024, unitSize);
		}

		if (storage === Infinity) return "Infinity";

		let num = 0;

		while (storage > 1024) {
			storage /= 1024;
			++num;
		}

		return `${storage.toFixed(1)} ${STORAGE_UNITS[num]}`;
	}

	public static async sizeOfDir(directory: string): Promise<number> {
		const files = await readdir(directory);

		let size = 0;
		for (let i = 0, L = files.length; i !== L; ++i) {
			const sta = await stat(join(directory, files[i]));
			size += sta.size;
		}

		return size;
	}

	public static userSort(users: Domain[], sort: AdminUserSort) {
		const sortByName = (a: Domain, b: Domain) => {
			if (a.domain < b.domain) return -1;
			if (a.domain > b.domain) return 1;

			return 0;
		};

		switch (sort) {
			case AdminUserSort.DATE_NEW_OLD:
				users = users.sort((a, b) => b.date.getTime() - a.date.getTime());
				break;
			case AdminUserSort.DATE_OLD_NEW:
				users = users.sort((a, b) => a.date.getTime() - b.date.getTime());
				break;
			case AdminUserSort.NAME_A_Z:
				users = users.sort(sortByName);
				break;
			case AdminUserSort.NAME_Z_A:
				users = users.sort(sortByName).reverse();
				break;
			case AdminUserSort.LIMIT_HIGH_LOW:
				users = users.sort((a, b) => b.maxStorage - a.maxStorage);
				break;
			case AdminUserSort.LIMIT_LOW_HIGH:
				users = users.sort((a, b) => a.maxStorage - b.maxStorage);
				break;
			case AdminUserSort.USAGE_HIGH_LOW:
				users = users.sort((a, b) => b.storage - a.storage);
				break;
			case AdminUserSort.USAGE_LOW_HIGH:
				users = users.sort((a, b) => a.storage - b.storage);
				break;
		}

		return users;
	}

	public static filesSort(files: File[], sort: FilesSort) {
		const sortByName = (a: File, b: File) => {
			if (a.id < b.id) return -1;
			if (a.id > b.id) return 1;

			return 0;
		};

		switch (sort) {
			case FilesSort.DATE_NEW_OLD:
				files = files.sort((a, b) => b.date.getTime() - a.date.getTime());
				break;
			case FilesSort.DATE_OLD_NEW:
				files = files.sort((a, b) => a.date.getTime() - b.date.getTime());
				break;
			case FilesSort.NAME_A_Z:
				files = files.sort(sortByName);
				break;
			case FilesSort.NAME_Z_A:
				files = files.sort(sortByName).reverse();
				break;
			case FilesSort.SIZE_LARGE_SMALL:
				files = files.sort((a, b) => Utils.parseStorage(b.size) - Utils.parseStorage(a.size));
				break;
			case FilesSort.SIZE_SMALL_LARGE:
				files = files.sort((a, b) => Utils.parseStorage(a.size) - Utils.parseStorage(b.size));
				break;
			case FilesSort.VIEWS_HIGH_LOW:
				files = files.sort((a, b) => b.views - a.views);
				break;
			case FilesSort.VIEWS_LOW_HIGH:
				files = files.sort((a, b) => a.views - b.views);
				break;
		}

		return files;
	}

	public static binSort(bins: Pastebin[], sort: BinSort) {
		const sortByName = (a: Pastebin, b: Pastebin) => {
			if (a.id < b.id) return -1;
			if (a.id > b.id) return 1;

			return 0;
		};

		switch (sort) {
			case BinSort.DATE_NEW_OLD:
				bins = bins.sort((a, b) => b.date.getTime() - a.date.getTime());
				break;
			case BinSort.DATE_OLD_NEW:
				bins = bins.sort((a, b) => a.date.getTime() - b.date.getTime());
				break;
			case BinSort.NAME_A_Z:
				bins = bins.sort(sortByName);
				break;
			case BinSort.NAME_Z_A:
				bins = bins.sort(sortByName).reverse();
				break;
			case BinSort.VIEWS_HIGH_LOW:
				bins = bins.sort((a, b) => b.views - a.views);
				break;
			case BinSort.VIEWS_LOW_HIGH:
				bins = bins.sort((a, b) => a.views - b.views);
				break;
		}

		return bins;
	}

	public static urlSort(urls: Url[], sort: UrlsSort) {
		const sortByName = (a: Url, b: Url) => {
			if (a.id < b.id) return -1;
			if (a.id > b.id) return 1;

			return 0;
		};

		switch (sort) {
			case UrlsSort.DATE_NEW_OLD:
				urls = urls.sort((a, b) => b.date.getTime() - a.date.getTime());
				break;
			case UrlsSort.DATE_OLD_NEW:
				urls = urls.sort((a, b) => a.date.getTime() - b.date.getTime());
				break;
			case UrlsSort.NAME_A_Z:
				urls = urls.sort(sortByName);
				break;
			case UrlsSort.NAME_Z_A:
				urls = urls.sort(sortByName).reverse();
				break;
			case UrlsSort.VISITS_HIGH_LOW:
				urls = urls.sort((a, b) => b.visits - a.visits);
				break;
			case UrlsSort.VISITS_LOW_HIGH:
				urls = urls.sort((a, b) => a.visits - b.visits);
				break;
		}

		return urls;
	}

	public static checkColor(color: string): boolean {
		return /^#([0-9a-f]{3}){1,2}$/i.test(color);
	}
}

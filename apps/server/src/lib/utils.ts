import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import type { Domain } from "./index.js";
import { AdminUserSort } from "./types.js";

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Utils {
	public static chunk<T>(arr: T[], size: number): T[][] {
		const result = [];
		const L = arr.length;
		let i = 0;

		while (i < L) result.push(arr.slice(i, (i += size)));

		return result;
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
}

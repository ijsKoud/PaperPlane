import { hash, verify as Verify } from "argon2";
import { readdir, stat } from "fs/promises";
import { join } from "path";
import { Link } from "./types";

export const encrypt = async (str: string): Promise<string> => {
	return await hash(str);
};

export const verify = async (pw: string, pwHash: string): Promise<boolean> => {
	return await Verify(pwHash, pw);
};

export const sizeOfDir = async (directory: string): Promise<number> => {
	const files = await readdir(directory);

	let size = 0;
	for (let i = 0, L = files.length; i !== L; ++i) {
		const sta = await stat(join(directory, files[i]));
		size += sta.size;
	}

	return size;
};

export const formatBytes = (bytes: number): string => {
	const units = ["B", "kB", "MB", "GB", "TB", "PB"];
	let num = 0;

	while (bytes > 1024) {
		bytes /= 1024;
		++num;
	}

	return `${bytes.toFixed(1)} ${units[num]}`;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseQuery = (query: any): string => {
	return Array.isArray(query) ? query[0] : query;
};

export const chunk = <T>(arr: T[], size: number): T[][] => {
	const result = [];
	const L = arr.length;
	let i = 0;

	while (i < L) result.push(arr.slice(i, (i += size)));

	return result;
};

export const sortFilesArray = (array: File[], type: string): File[] => {
	const sortByName = (a: File, b: File) => {
		if (a.name < b.name) return -1;
		if (a.name > b.name) return 1;

		return 0;
	};

	switch (type) {
		default:
		case "default":
		case "date-new":
			return array.sort((a, b) => b.date - a.date);
		case "date-old":
			return array.sort((a, b) => a.date - b.date);
		case "bytes-small":
			return array.sort((a, b) => b._size - a._size);
		case "bytes-large":
			return array.sort((a, b) => a._size - b._size);
		case "name":
			return array.sort(sortByName);
		case "name-reverse":
			return array.sort(sortByName).reverse();
	}
};

export const sortLinksArray = (array: Link[], type: string): Link[] => {
	const sortByName = (a: Link, b: Link) => {
		if (a.name < b.name) return -1;
		if (a.name > b.name) return 1;

		return 0;
	};

	switch (type) {
		default:
		case "default":
		case "date-new":
			return array.sort((a, b) => b.date - a.date);
		case "date-old":
			return array.sort((a, b) => a.date - b.date);
		case "name":
			return array.sort(sortByName);
		case "name-reverse":
			return array.sort(sortByName).reverse();
	}
};

interface File {
	name: string;
	size: string;
	_size: number;
	date: number;
	type: string;
}

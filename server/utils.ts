import { User, PrismaClient } from "@prisma/client";
import { hash, verify as Verify } from "argon2";
import { mkdir, readdir, stat, writeFile } from "fs/promises";
import { nanoid } from "nanoid";
import { join } from "path";
import { File, Link } from "./types";

const client = new PrismaClient();

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
	switch (type) {
		default:
		case "default":
		case "date-new":
			return array.sort((a, b) => b.date - a.date);
		case "date-old":
			return array.sort((a, b) => a.date - b.date);
	}
};

export const createUser = async (username: string, password: string): Promise<User> => {
	let id = nanoid(8);
	while (await client.user.findFirst({ where: { userId: id } })) id = nanoid(8);

	if (await client.user.findFirst({ where: { username } }))
		throw "User with that username already exists";

	const hashed = await encrypt(password);
	const user = await client.user.create({
		data: { userId: id, username, password: hashed, token: generateToken() },
	});

	const base = join(process.cwd(), "data", id);
	await mkdir(join(base, "files"), { recursive: true });
	await writeFile(join(base, "links.json"), JSON.stringify([]));

	return user;
};

export const randomChars = (length: number): string => {
	const charset = "QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm1234567890";

	let str = "";
	for (let i = 0; i !== length; ++i) str += charset[Math.floor(Math.random() * charset.length)];
	return str;
};

export const generateToken = (): string => {
	const date = Buffer.from(Date.now().toString()).toString("base64url");
	return `${randomChars(24)}.${date}`;
};

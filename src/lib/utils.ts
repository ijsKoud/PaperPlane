import type { User } from "@prisma/client";
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";
import { readdir, stat } from "fs/promises";
import type { NextApiRequest } from "next";
import { join } from "path";
import prisma from "./prisma";
import type { ApiFile, ApiURL } from "./types";

export function randomChars(length: number) {
	const charset = "QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm1234567890";

	let res = "";
	for (let i = 0; i !== length; ++i) res += charset[Math.floor(Math.random() * charset.length)];
	return res;
}

export function createToken() {
	return `${randomChars(24)}.${Buffer.from(Date.now().toString()).toString("base64url")}`;
}

export function encryptPassword(password: string): string {
	const salt = randomBytes(16).toString("hex");
	const pwd = scryptSync(password, salt, 64).toString("hex");

	return `${salt}:${pwd}`;
}

export function encryptToken(str: string): string {
	const secretKey = process.env.ENCRYPTION_KEY as string;
	const iv = randomBytes(16);

	const cipher = createCipheriv("aes-256-ctr", secretKey, iv);
	const encrypted = Buffer.concat([cipher.update(str), cipher.final()]);

	return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptToken(hash: string): string {
	const secretKey = process.env.ENCRYPTION_KEY as string;
	const [iv, encrypted] = hash.split(":");

	const decipher = createDecipheriv("aes-256-ctr", secretKey, Buffer.from(iv, "hex"));
	const decrypted = Buffer.concat([decipher.update(Buffer.from(encrypted, "hex")), decipher.final()]);
	const token = decrypted.toString();

	return token;
}

export async function sizeOfDir(directory: string): Promise<number> {
	const files = await readdir(directory);

	let size = 0;
	for (let i = 0, L = files.length; i !== L; ++i) {
		const sta = await stat(join(directory, files[i]));
		size += sta.size;
	}

	return size;
}

export function formatBytes(bytes: number): string {
	const units = ["B", "kB", "MB", "GB", "TB", "PB"];
	let num = 0;

	while (bytes > 1024) {
		bytes /= 1024;
		++num;
	}

	return `${bytes.toFixed(1)} ${units[num]}`;
}

export async function getUser(req: NextApiRequest): Promise<User | null> {
	try {
		const { authorization } = req.headers;
		if (!authorization || !authorization.startsWith("Bearer ") || authorization.includes("null")) return null;

		const [username] = decryptToken(authorization.replace("Bearer ", "")).split(".");
		const user = await prisma.user.findFirst({ where: { username } });

		return user;
	} catch (err) {}

	return null;
}

export async function getUserWithToken(req: NextApiRequest): Promise<User | null> {
	const { authorization } = req.headers;
	if (!authorization?.length) return null;

	const user = await prisma.user.findFirst({ where: { token: authorization } });

	return user;
}

export function getFileExt(file: string): string {
	return `.${file.split(".").slice(1).join(".")}`;
}

export function parseQuery(query: any): string {
	return Array.isArray(query) ? query[0] : query;
}

type AltApiFile = ApiFile & { _size: bigint };
export function sortFilesArray(array: AltApiFile[], type: string): AltApiFile[] {
	const sortByName = (a: AltApiFile, b: AltApiFile) => {
		if (a.name < b.name) return -1;
		if (a.name > b.name) return 1;

		return 0;
	};

	switch (type) {
		default:
		case "default":
		case "date-new":
			array = array.sort((a, b) => b.date.getTime() - a.date.getTime());
			break;
		case "date-old":
			array = array.sort((a, b) => a.date.getTime() - b.date.getTime());
			break;
		case "views-up":
			array = array.sort((a, b) => b.views - a.views);
			break;
		case "views-down":
			array = array.sort((a, b) => a.views - b.views);
			break;
		case "bytes-small":
			array = array.sort((a, b) => Number(b._size) - Number(a._size));
			break;
		case "bytes-large":
			array = array.sort((a, b) => Number(a._size) - Number(b._size));
			break;
		case "name":
			array = array.sort(sortByName);
			break;
		case "name-reverse":
			array = array.sort(sortByName).reverse();
			break;
	}

	return array.map((v) => {
		// @ts-ignore no it does not
		delete v._size;
		return v;
	});
}

export function sortLinksArray(array: ApiURL[], type: string): ApiURL[] {
	const sortByName = (a: ApiURL, b: ApiURL) => {
		if (a.name < b.name) return -1;
		if (a.name > b.name) return 1;

		return 0;
	};

	switch (type) {
		default:
		case "default":
		case "date-new":
			return array.sort((a, b) => b.date.getTime() - a.date.getTime());
		case "date-old":
			return array.sort((a, b) => a.date.getTime() - b.date.getTime());
		case "visits-up":
			return array.sort((a, b) => b.visits - a.visits);
		case "visits-down":
			return array.sort((a, b) => a.visits - b.visits);
		case "name":
			return array.sort(sortByName);
		case "name-reverse":
			return array.sort(sortByName).reverse();
	}
}

export function chunk<T>(arr: T[], size: number): T[][] {
	const result = [];
	const L = arr.length;
	let i = 0;

	while (i < L) result.push(arr.slice(i, (i += size)));

	return result;
}

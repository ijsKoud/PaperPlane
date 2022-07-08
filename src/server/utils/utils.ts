import type { PrismaClient } from "@prisma/client";
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";
import ShortUniqueId from "short-unique-id";
import type { ApiFile, ApiURL, CleanUser, Config, NameType } from "./types";

export const getConfig = (): Config => {
	const encryptionKey = process.env.ENCRYPTION_KEY ?? "";
	if (!encryptionKey || encryptionKey.length !== 32) {
		console.log("A valid Encryption key of 32 characters long needs to be provided.");
		process.exit(1);
	}

	const nameType = ["id", "zerowidth", "name"].includes(process.env.NAME_TYPE ?? "") ? (process.env.NAME_TYPE as NameType) : "id";
	const extensions = process.env.EXTENSIONS ? process.env.EXTENSIONS.split(",") : [];

	let port = Number(process.env.PORT);
	if (isNaN(port)) port = 3000;

	let nameLength = Number(process.env.NAME_LENGTH);
	if (isNaN(nameLength)) nameLength = 10;

	let maxFileSize = Number(process.env.MAX_FILE_SIZE);
	if (isNaN(maxFileSize)) maxFileSize = Infinity;

	let maxFilesPerRequest = Number(process.env.MAX_FILES_PER_REQUEST);
	if (isNaN(maxFilesPerRequest)) maxFilesPerRequest = Infinity;

	let migration = Number(process.env.AUTO_MIGRATION);
	if (isNaN(migration)) migration = 6e2; // 10 minutes = 600 seconds
	migration *= 1e3;

	return {
		encryptionKey,
		port,
		nameType,
		extensions,
		maxFileSize,
		maxFilesPerRequest,
		nameLength,
		migration
	};
};

export function encryptToken(str: string): string {
	const secretKey = process.env.ENCRYPTION_KEY as string;
	const iv = randomBytes(16);

	const cipher = createCipheriv("aes-256-ctr", secretKey, iv);
	const encrypted = Buffer.concat([cipher.update(str), cipher.final()]);

	return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

export const generateId = (overwrite?: boolean): string => {
	let { nameType, nameLength: length } = getConfig();
	let id: string;

	if (overwrite) nameType = "id";
	switch (nameType) {
		case "id":
		default:
			{
				const genId = new ShortUniqueId({ length });
				id = genId();
			}
			break;
		case "zerowidth":
			{
				const invisibleCharset = ["\u200B", "\u2060", "\u200C", "\u200D"];
				id = [...randomBytes(length)]
					.map((byte) => invisibleCharset[Number(byte) % invisibleCharset.length])
					.join("")
					.slice(1)
					.concat(invisibleCharset[0]);
			}
			break;
		case "name":
			id = "";
			break;
	}

	return id;
};

export function formatBytes(bytes: number) {
	if (bytes === Infinity) return "Infinity";

	const units = ["B", "kB", "MB", "GB", "TB", "PB"];
	let num = 0;

	while (bytes > 1024) {
		bytes /= 1024;
		++num;
	}

	return `${bytes.toFixed(1)} ${units[num]}`;
}

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

export function decryptToken(hash: string): string {
	const secretKey = process.env.ENCRYPTION_KEY as string;
	const [iv, encrypted] = hash.split(":");

	const decipher = createDecipheriv("aes-256-ctr", secretKey, Buffer.from(iv, "hex"));
	const decrypted = Buffer.concat([decipher.update(Buffer.from(encrypted, "hex")), decipher.final()]);
	const token = decrypted.toString();

	return token;
}

export async function getUser(token: string, prisma: PrismaClient): Promise<CleanUser | null> {
	if (!token) return null;

	const [username] = decryptToken(token).split(".");
	const user = await prisma.user.findFirst({ where: { username } });

	// @ts-ignore removing password cuz not needed
	delete user?.password;
	return user;
}

export const getProtocol = () => {
	const env = process.env.SECURE;
	if (env && env === "false") return "http://";

	return "https://";
};

export function getFileExt(file: string): string {
	return `.${file.split(".").slice(1).join(".")}`;
}

type AltApiFile = ApiFile & { _size: bigint };
export function sortFilesArray(array: AltApiFile[], type: string): ApiFile[] {
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
	}) as any;
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

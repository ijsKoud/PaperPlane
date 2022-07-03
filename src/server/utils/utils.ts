import type { PrismaClient, User } from "@prisma/client";
import { createDecipheriv, randomBytes, scryptSync } from "node:crypto";
import ShortUniqueId from "short-unique-id";
import type { Config, NameType } from "./types";

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

	return {
		encryptionKey,
		port,
		nameType,
		extensions,
		maxFileSize,
		maxFilesPerRequest,
		nameLength
	};
};

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

export async function getUser(token: string, prisma: PrismaClient): Promise<User | null> {
	if (!token) return null;

	const [username] = decryptToken(token).split(".");
	const user = await prisma.user.findFirst({ where: { username } });

	return user;
}

export async function getUserFromAuth(token: string | undefined, prisma: PrismaClient): Promise<User | null> {
	if (!token || !token.startsWith("Bearer ") || ["null", "undefined"].some((str) => token?.includes(str))) return null;
	token = token.replace("Bearer", "").trim();

	return getUser(token, prisma);
}

export const getProtocol = () => {
	const env = process.env.SECURE;
	if (env && env === "false") return "http://";

	return "https://";
};

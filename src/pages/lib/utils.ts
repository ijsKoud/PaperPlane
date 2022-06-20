import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";
import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";

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

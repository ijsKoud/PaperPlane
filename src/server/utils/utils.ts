import { randomBytes } from "node:crypto";
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

export const generateId = (): string => {
	const { nameType, nameLength: length } = getConfig();
	let id: string;

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

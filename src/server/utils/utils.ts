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
	// TODO: switch case for multiple different id types

	const id = new ShortUniqueId({ length: 10 });
	return id();
};

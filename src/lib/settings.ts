const settings = {
	allowedExtensions: parseEnvArray(process.env.ALLOWED_EXTENSIONS),
	maxFilesPerRequest: parseEnvInt(process.env.MAX_FILES_PER_REQUEST),
	maxFileSize: parseEnvInt(process.env.MAX_FILE_SIZE),
	customFileName: parseEnvBoolean(process.env.CUSTOM_FILE_NAME),
	fileNameLength: parseEnvInt(process.env.FILE_NAME_LENGTH, 8)
};

function parseEnvArray(item: string | undefined): string[] {
	if (!item) return [];

	return item.split(",");
}

function parseEnvInt(item: string | undefined, fallback?: number): number {
	if (!item) return fallback ?? Infinity;

	const parsed = Number(item);
	return isNaN(parsed) ? fallback ?? Infinity : parsed;
}

function parseEnvBoolean(item: string | undefined): boolean {
	if (!item) return false;

	if (item.toLowerCase() === "false") return false;
	return true;
}

export default settings;

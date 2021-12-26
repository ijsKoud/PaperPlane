const settings = {
	allowedExtensions: parseEnvArray(process.env.ALLOWED_EXTENSIONS),
	maxFilesPerRequest: parseEnvInt(process.env.MAX_FILES_PER_REQUEST),
	maxFileSize: parseEnvInt(process.env.MAX_FILE_SIZE)
};

function parseEnvArray(item: string | undefined): string[] {
	if (!item) return [];

	return item.split(",");
}

function parseEnvInt(item: string | undefined): number {
	if (!item) return Infinity;

	const parsed = Number(item);
	return isNaN(parsed) ? Infinity : parsed;
}

export default settings;

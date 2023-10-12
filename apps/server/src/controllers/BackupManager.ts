import type Server from "#server.js";
import { Unzip, Zip } from "zip-lib";
import { join } from "node:path";
import { readdir, readFile, rm, writeFile } from "node:fs/promises";
import { Auth } from "#lib/Auth.js";
import BackupV410 from "#components/backup/versions/backup-4.1.0.js";
import BackupV400 from "#components/backup/versions/backup-4.0.0.js";
import BackupV300 from "#components/backup/versions/backup-3.0.0.js";
import Config from "#lib/Config.js";

export class BackupManager {
	/** The base data directory */
	public dataDirectory = join(process.cwd(), "..", "..", "data");

	/** The base backup directory */
	public backupDirectory = join(this.dataDirectory, "backups");

	/** The id of the backup that is currently being imported */
	public backupImportInProgress: string | undefined;

	/** Whether a backup is being created or not */
	public backupCreateInProgress = false;

	public backups: Record<string, BackupV400 | BackupV300 | BackupV410> = {
		v410: new BackupV410(this.server, this.dataDirectory),
		v400: new BackupV400(this.server, this.dataDirectory),
		v300: new BackupV300(this.server, this.dataDirectory)
	};

	public constructor(public readonly server: Server) {}

	/**
	 * Create a new backup
	 * @returns the backup id
	 */
	public async createBackup() {
		this.backupCreateInProgress = true;

		try {
			const config = Config.getEnv();
			const { prisma } = this.server;

			const databaseData = {
				version: "4.1.0",
				encryption: config.encryptionKey,
				users: await prisma.domain.findMany({ include: { apiTokens: true } }),
				files: await prisma.file.findMany(),
				pasteBins: await prisma.pastebin.findMany(),
				urls: await prisma.url.findMany(),
				auditlogs: await prisma.auditlog.findMany(),
				invites: await prisma.invites.findMany(),
				signupDomains: await prisma.signupDomain.findMany()
			};

			// generate unique id
			const id = `backup-${Auth.generateToken(16)}`;
			const filePath = join(this.backupDirectory, "temp", `${id}-file.json`);
			await writeFile(filePath, JSON.stringify(databaseData));

			// create backup
			const zip = new Zip();
			zip.addFolder(join(this.dataDirectory, "files"), "files");
			zip.addFolder(join(this.dataDirectory, "paste-bins"), "paste-bins");
			zip.addFile(filePath, "db.json");

			await zip.archive(join(this.backupDirectory, "archives", `${id}.zip`));
			await rm(filePath, { maxRetries: 4, retryDelay: 1e3 });
			return id;
		} catch (err) {
			this.server.logger.fatal("[BACKUP]: Fatal error while creating a backup ", err);
		}

		this.backupCreateInProgress = false;
		return undefined;
	}

	/**
	 * Import a backup
	 * @param id The id of the backup
	 * @returns
	 */
	public async import(id: string): Promise<boolean | { errors: Record<string, any> }> {
		try {
			const backups = await readdir(join(this.backupDirectory, "archives"));
			if (!backups.includes(`${id}.zip`)) return false;

			this.backupImportInProgress = id;

			// unzip the backip
			const extractFolder = join(this.backupDirectory, "temp", id);
			const unzip = new Unzip();
			await unzip.extract(join(this.backupDirectory, "archives", `${id}.zip`), extractFolder);

			// get correct parser
			const jsonStr = await readFile(join(extractFolder, "db.json"), "utf8");
			const version: string = JSON.parse(jsonStr).version ?? "";
			const versionParsed = `v${version.replace(/\./g, "")}`;
			if (this.backups[versionParsed]) await this.backups[versionParsed].import(extractFolder);

			// remove temporary directories
			await rm(extractFolder, { recursive: true, maxRetries: 5, retryDelay: 1e3 });
		} catch (err) {
			if ("message" in err && err.message.includes("errors:")) return JSON.parse(err.message);
			this.server.logger.fatal("[BACKUP]: Fatal error while importing a backup ", err);
			return false;
		}

		this.backupImportInProgress = undefined;
		return true;
	}
}

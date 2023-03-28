import type Server from "../../Server.js";
import { Unzip, Zip } from "zip-lib";
import { join } from "node:path";
import { readdir, readFile, rm, writeFile } from "node:fs/promises";
import { Auth } from "../Auth.js";
import { BackupV400 } from "./versions/Backup-4.0.0.js";
import { BackupV300 } from "./versions/backup-3.0.0.js";
import { BackupV410 } from "./versions/backup-4.1.0.js";

export class Backups {
	public baseDataFolder = join(process.cwd(), "..", "..", "data");
	public baseBackupFolder = join(this.baseDataFolder, "backups");

	public backups: Record<string, BackupV400 | BackupV300 | BackupV410> = {
		v410: new BackupV410(this.server, this.baseDataFolder),
		v400: new BackupV400(this.server, this.baseDataFolder),
		v300: new BackupV300(this.server, this.baseDataFolder)
	};

	public constructor(public server: Server) {}

	public async createBackup() {
		try {
			const { prisma, envConfig } = this.server;
			const databaseData = {
				version: "4.1.0",
				encryption: envConfig.encryptionKey,
				users: await prisma.domain.findMany({ include: { apiTokens: true } }),
				files: await prisma.file.findMany(),
				urls: await prisma.url.findMany(),
				auditlogs: await prisma.auditlog.findMany(),
				invites: await prisma.invites.findMany(),
				signupDomains: await prisma.signupDomain.findMany()
			};

			const id = `backup-${Auth.generateToken(16)}`;
			const filePath = join(this.baseBackupFolder, "temp", `${id}-file.json`);
			await writeFile(filePath, JSON.stringify(databaseData));

			const zip = new Zip();
			zip.addFolder(join(this.baseDataFolder, "files"), "files");
			zip.addFile(filePath, "db.json");

			await zip.archive(join(this.baseBackupFolder, "archives", `${id}.zip`));
			await rm(filePath, { maxRetries: 4, retryDelay: 1e3 });
			return id;
		} catch (err) {
			this.server.logger.fatal("[BACKUP]: Fatal error while creating a backup ", err);
		}

		return undefined;
	}

	public async import(id: string): Promise<boolean | { errors: Record<string, any> }> {
		try {
			const backups = await readdir(join(this.baseBackupFolder, "archives"));
			if (!backups.includes(`${id}.zip`)) return false;

			const extractFolder = join(this.baseBackupFolder, "temp", id);
			const unzip = new Unzip();
			await unzip.extract(join(this.baseBackupFolder, "archives", `${id}.zip`), extractFolder);

			const jsonStr = await readFile(join(extractFolder, "db.json"), "utf8");
			const version: string = JSON.parse(jsonStr).version ?? "";
			const versionParsed = `v${version.replace(/\./g, "")}`;
			if (this.backups[versionParsed]) await this.backups[versionParsed].import(extractFolder);

			await rm(extractFolder, { recursive: true, maxRetries: 5, retryDelay: 1e3 });
		} catch (err) {
			if ("message" in err && err.message.includes("errors:")) return JSON.parse(err.message);
			this.server.logger.fatal("[BACKUP]: Fatal error while importing a backup ", err);
			return false;
		}

		return true;
	}
}

import type Server from "../Server.js";
import { Zip } from "zip-lib";
import { join } from "node:path";
import { rm, writeFile } from "node:fs/promises";
import { Auth } from "./Auth.js";

export class Backups {
	public baseDataFolder = join(process.cwd(), "..", "..", "data");
	public baseBackupFolder = join(this.baseDataFolder, "backups");

	public constructor(public server: Server) {}

	public async createBackup() {
		try {
			const { prisma, envConfig } = this.server;
			const databaseData = {
				version: "4.0.0",
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
}

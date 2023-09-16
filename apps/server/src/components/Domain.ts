import DisabledDomainError from "#errors/DisabledDomainError.js";
import Config from "#lib/Config.js";
import { Utils } from "#lib/utils.js";
import type Server from "#server.js";
import type { Domain as DomainInterface, Prisma, Token } from "@prisma/client";
import { CronJob } from "cron";
import ms from "ms";
import { existsSync } from "node:fs";
import { mkdir, readdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { AuditLog } from "./AuditLog.js";
import { Auth } from "#lib/Auth.js";

type iDomain = DomainInterface & {
	apiTokens: Token[];
};

export default class Domain {
	/** The server instance that initiated this domain */
	public server: Server;
	/** The name of this domain (user) */
	public domain!: string;
	/** The creation date */
	public date!: Date;
	/** Whether or not the domain is disabled */
	public disabled!: boolean;

	/** The id of the folder where all the content is stored */
	public pathId!: string;
	/** The path to the files directory where all the files are stored */
	public filesPath!: string;
	/** The path to the paste-bins directory where all the paste-bins are stored */
	public pastebinPath!: string;

	/** The maximum file size per upload */
	public uploadSize!: number;
	/** The maximum file storage allocated to this domain */
	public maxStorage!: number;
	/** The duration the auditlogs should stay visible for */
	public auditlogDuration!: number;
	/** The amount of storage (in Bytes) that this domain has taken up */
	public storage = 0;

	/** The file extensions to match */
	public extensions!: string[];
	/** Whether the matched file extensions are allowed or disallowed */
	public extensionsMode!: "block" | "pass";

	/** Authentication secret for this domain */
	public secret!: string;
	/** The backup codes for this domain */
	public codes!: string[];
	/** The API Tokens for this domain */
	public apiTokens!: Token[];

	/** The content name strategy */
	public nameStrategy!: "id" | "name" | "zerowidth";
	/** The length the generated name should be */
	public nameLength!: number;

	/** The Discord Embed (OG METADATA) title */
	public embedTitle!: string;
	/** The Discord Embed (OG METADATA) description */
	public embedDescription!: string;
	/** The Discord Embed (OG METADATA) color */
	public embedColor!: string;
	/** The Discord Embed (OG METADATA) visibility status */
	public embedEnabled!: boolean;

	public auditlogs: AuditLog;

	private storageCheckCron!: CronJob;
	private storageSyncCron!: CronJob;

	public constructor(server: Server, data: iDomain) {
		this.server = server;
		this._parse(data);

		this.auditlogs = new AuditLog(server, this.domain, this.auditlogDuration);
	}

	/** Starts the asynchronous functions */
	public async start() {
		await this.recordStorage();
		await this.syncStorage();
	}

	/** Resets this domain and removes all the data from the system */
	public async reset() {
		if (this.disabled) throw new DisabledDomainError();

		// Clears the files from the files directory of this domain
		await rm(this.filesPath, { recursive: true });
		await mkdir(this.filesPath, { recursive: true });

		// Clears the pastebins from the pastebins directory of this domain
		await rm(this.pastebinPath, { recursive: true });
		await mkdir(this.pastebinPath, { recursive: true });

		// Removes all the records of this domain from the database
		await this.server.prisma.file.deleteMany({ where: { domain: this.domain } });
		await this.server.prisma.url.deleteMany({ where: { domain: this.domain } });
		await this.server.prisma.token.deleteMany({ where: { domain: this.domain } });
		await this.server.prisma.pastebin.deleteMany({ where: { domain: this.domain } });

		// Creates a new clean domain
		const res = await this.server.prisma.domain.delete({ where: { domain: this.domain } });
		const newDomain = await this.server.prisma.domain.create({
			data: {
				disabled: res.disabled,
				auditlogDuration: res.auditlogDuration,
				domain: this.domain,
				date: this.date,
				backupCodes: "paperplane-cdn",
				pathId: res.pathId
			},
			include: { apiTokens: true }
		});

		this.auditlogs.register("Reset", "Full account reset");
		this._parse(newDomain);
	}

	/**
	 * Resets the encryption key
	 * @param oldKey The old encryption key
	 */
	public async resetEncryption(oldKey: string) {
		const config = Config.getEnv();

		if (config.authMode === "password") {
			const decrypted = Auth.decryptToken(this.secret, oldKey);
			const encrypted = Auth.encryptToken(decrypted, config.encryptionKey);
			const domain = await this.server.prisma.domain.update({
				where: { domain: this.domain },
				data: { password: encrypted },
				include: { apiTokens: true }
			});

			this._parse(domain);
		}

		const files = await this.server.prisma.file.findMany({ where: { domain: this.domain } });
		for await (const file of files) {
			if (!file.password) continue;
			const decrypted = Auth.decryptToken(file.password, oldKey);
			const encrypted = Auth.encryptToken(decrypted, config.encryptionKey);
			await this.server.prisma.file.update({ where: { id_domain: { domain: this.domain, id: file.id } }, data: { password: encrypted } });
		}

		const bins = await this.server.prisma.file.findMany({ where: { domain: this.domain } });
		for await (const bin of bins) {
			if (!bin.password) continue;
			const decrypted = Auth.decryptToken(bin.password, oldKey);
			const encrypted = Auth.encryptToken(decrypted, config.encryptionKey);
			await this.server.prisma.pastebin.update({ where: { id_domain: { domain: this.domain, id: bin.id } }, data: { password: encrypted } });
		}

		this.auditlogs.register("Reset", "Encryption key reset");
	}

	/** Resets the authentication */
	public async resetAuth() {
		const res = await this.server.prisma.domain.update({
			where: { domain: this.domain },
			data: { password: null, twoFactorSecret: null, backupCodes: "paperplane-cdn" },
			include: { apiTokens: true }
		});

		this._parse(res);
		this.auditlogs.register("Reset", "Authentication reset");
	}

	/** Deletes the domain from the system */
	public async delete() {
		// Removes the files of this domain from the drive
		await rm(this.filesPath, { recursive: true });
		await rm(this.pastebinPath, { recursive: true });

		// Removes all domain records from the database
		await this.auditlogs.destroy();
		await this.server.prisma.file.deleteMany({ where: { domain: this.domain } });
		await this.server.prisma.pastebin.deleteMany({ where: { domain: this.domain } });
		await this.server.prisma.url.deleteMany({ where: { domain: this.domain } });
		await this.server.prisma.token.deleteMany({ where: { domain: this.domain } });
		await this.server.prisma.domain.delete({ where: { domain: this.domain } });

		// stops the running cronjobs
		this.storageCheckCron.stop();
		this.storageSyncCron.stop();
	}

	/**
	 * Update the domains data
	 * @param data The updated data
	 * @param auditlog Whether or not to log this event in the admin logs
	 */
	public async update(data: Prisma.DomainUpdateArgs["data"], auditlog = true) {
		const res = await this.server.prisma.domain.update({ where: { domain: this.domain }, data, include: { apiTokens: true } });
		this._parse(res);

		if (auditlog) this.server.adminAuditLogs.register("Update User", `User: ${this.domain} (${res.pathId})`);
		this.auditlogs.register("Update User", "User settings updated");
		this.auditlogs.maxAge = this.auditlogDuration;
	}

	/**
	 * Remove backup code from the list
	 * @param code The code to remove
	 */
	public async removeCode(code: string) {
		if (this.disabled) throw new DisabledDomainError();

		this.codes = this.codes.filter((c) => c !== code);
		const res = await this.server.prisma.domain.update({
			where: { domain: this.domain },
			data: { backupCodes: this.codes.join(",") },
			include: { apiTokens: true }
		});

		this._parse(res);
	}

	/**
	 * Create a new API token
	 * @param name The name of the API token
	 * @returns
	 */
	public async createToken(name: string) {
		if (this.disabled) throw new DisabledDomainError();

		const token = await this.server.prisma.token.create({ data: { domain: this.domain, name, token: Auth.generateToken(32) } });
		this.apiTokens.push(token);

		this.auditlogs.register("API Token", `New token created (Name=${name})`);

		return token;
	}

	/**
	 * Deletes API tokens
	 * @param tokens The tokens to delete
	 */
	public async deleteTokens(tokens: string[]) {
		if (this.disabled) throw new DisabledDomainError();

		await this.server.prisma.token.deleteMany({ where: { name: { in: tokens } } });
		const res = await this.server.prisma.token.findMany({ where: { domain: this.domain } });
		this.apiTokens = res;

		this.auditlogs.register("API Token", `Tokens deleted (Amount=${tokens.length})`);
	}

	public toString() {
		return this.domain;
	}

	public toJSON() {
		return {
			raw: {
				domain: this.domain,
				date: this.date,
				disabled: this.disabled,
				extensions: this.extensions,
				extensionsMode: this.extensionsMode,
				maxStorage: this.maxStorage,
				storage: this.storage,
				uploadSize: this.uploadSize,
				auditlog: this.auditlogDuration
			},
			parsed: {
				domain: this.domain,
				date: this.date,
				disabled: this.disabled,
				extensions: this.extensions,
				extensionsMode: this.extensionsMode,
				storage: Utils.parseStorage(this.storage),
				uploadSize: Utils.parseStorage(this.uploadSize),
				auditlog: ms(this.auditlogDuration)
			}
		};
	}

	private async syncStorage() {
		const syncFnFile = async () => {
			if (!existsSync(this.filesPath)) await mkdir(this.filesPath);
			const filesInDir = await readdir(this.filesPath).catch<string[]>(() => []);
			const filesInDb = (await this.server.prisma.file.findMany({ where: { domain: this.domain } })).map(
				(file) => file.path.split("/").reverse()[0]
			);

			const missingInDb = filesInDir.filter((file) => !filesInDb.includes(file));
			const missingInDir = filesInDb.filter((file) => !filesInDir.includes(file));

			// Removes all the files not linked in the database
			for (const file of missingInDb) {
				await rm(join(this.filesPath, file));
			}

			// removes all the database records without files on the drive
			await this.server.prisma.file.deleteMany({
				where: { domain: this.domain, path: { in: missingInDir.map((id) => join(this.filesPath, id)) } }
			});
		};

		const syncFnBin = async () => {
			if (!existsSync(this.pastebinPath)) await mkdir(this.pastebinPath);
			const binInDir = await readdir(this.pastebinPath).catch<string[]>(() => []);
			const binInDb = (await this.server.prisma.pastebin.findMany({ where: { domain: this.domain } })).map(
				(file) => file.path.split("/").reverse()[0]
			);

			const missingInDb = binInDir.filter((file) => !binInDb.includes(file));
			const missingInDir = binInDb.filter((file) => !binInDir.includes(file));

			// Removes all the files not linked in the database
			for (const file of missingInDb) {
				await rm(join(this.pastebinPath, file));
			}

			// removes all the database records without files on the drive
			await this.server.prisma.pastebin.deleteMany({
				where: { domain: this.domain, path: { in: missingInDir.map((id) => join(this.pastebinPath, id)) } }
			});
		};

		const syncFn = async () => {
			await syncFnFile();
			await syncFnBin();
		};

		const cron = new CronJob("*/10 * * * *", syncFn);
		this.storageSyncCron = cron;
		cron.start();

		await syncFn();
	}

	private async recordStorage() {
		const updateStorageUsage = async () => {
			const res = await Utils.sizeOfDir(this.filesPath);
			this.storage = res;
		};

		const cron = new CronJob("* * * * *", updateStorageUsage);
		this.storageCheckCron = cron;
		cron.start();

		await updateStorageUsage();
	}

	private _parse(data: iDomain) {
		this.domain = data.domain;
		this.date = data.date;

		this.pathId = data.pathId;
		this.filesPath = join(process.cwd(), "..", "..", "data", "files", data.pathId);
		this.pastebinPath = join(process.cwd(), "..", "..", "data", "paste-bins", data.pathId);
		this.disabled = data.disabled;

		this.uploadSize = Utils.parseStorage(data.maxUploadSize);
		this.maxStorage = Utils.parseStorage(data.maxStorage);
		this.auditlogDuration = ms(data.auditlogDuration);

		this.extensions = data.extensionsList.split(",");
		this.extensionsMode = data.extensionsMode as "block" | "pass";

		this.nameLength = data.nameLength;
		this.nameStrategy = ["zerowidth", "name", "id"].includes(data.nameStrategy) ? (data.nameStrategy as "id" | "zerowidth" | "name") : "id";

		this.embedTitle = data.embedTitle.slice(0, 256);
		this.embedDescription = data.embedDescription.slice(0, 4096);
		this.embedColor = Utils.checkColor(data.embedColor) ? data.embedColor : "#000";
		this.embedEnabled = data.embedEnabled;

		this.secret = (Config.getEnv().authMode === "2fa" ? data.twoFactorSecret : data.password) ?? "";
		this.codes = data.backupCodes.split(",");
		this.apiTokens = data.apiTokens;
	}
}

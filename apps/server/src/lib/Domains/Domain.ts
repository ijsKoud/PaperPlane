import type Server from "../../Server.js";
import type { Domain as DomainInterface, Token, Prisma } from "@prisma/client";
import { Utils } from "../utils.js";
import { join } from "node:path";
import ms from "ms";
import { mkdir, readdir, rm } from "node:fs/promises";
import { AuditLog } from "../AuditLog.js";
import { Auth } from "../Auth.js";
import { Collection } from "@discordjs/collection";
import { CronJob } from "cron";
import { existsSync } from "node:fs";
import type { File } from "formidable";

type iDomain = DomainInterface & {
	apiTokens: Token[];
};

export class Domain {
	public domain!: string;
	public date!: Date;

	public pathId!: string;
	public filesPath!: string;
	public pastebinPath!: string;
	public disabled!: boolean;

	public uploadSize!: number;
	public maxStorage!: number;
	public auditlogDuration!: number;
	public storage = 0;

	public extensions!: string[];
	public extensionsMode!: "block" | "pass";

	public secret!: string;
	public codes!: string[];
	public apiTokens!: Token[];

	public nameStrategy!: "id" | "name" | "zerowidth";
	public nameLength!: number;

	public embedTitle!: string;
	public embedDescription!: string;
	public embedColor!: string;
	public embedEnabled!: boolean;

	public auditlogs: AuditLog;
	public views: string[] = [];
	public visits: string[] = [];
	public reads: string[] = [];

	private storageCheckCron!: CronJob;
	private storageSyncCron!: CronJob;

	private viewTimeout: NodeJS.Timeout | undefined;
	private visitTimeout: NodeJS.Timeout | undefined;
	private readTimeout: NodeJS.Timeout | undefined;

	public constructor(
		public server: Server,
		data: iDomain
	) {
		this._parse(data);
		this.auditlogs = new AuditLog(server, this.domain, this.auditlogDuration);
	}

	public async start() {
		this.recordStorage();
		this.syncStorage();

		await this.auditlogs.start();
	}

	public async reset() {
		await rm(this.filesPath, { recursive: true });
		await mkdir(this.filesPath, { recursive: true });

		await rm(this.pastebinPath, { recursive: true });
		await mkdir(this.pastebinPath, { recursive: true });

		await this.server.prisma.file.deleteMany({ where: { domain: this.domain } });
		await this.server.prisma.url.deleteMany({ where: { domain: this.domain } });
		await this.server.prisma.token.deleteMany({ where: { domain: this.domain } });
		await this.server.prisma.pastebin.deleteMany({ where: { domain: this.domain } });

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

	public async resetEncryption(oldKey: string) {
		if (this.server.envConfig.authMode === "password") {
			const decrypted = Auth.decryptToken(this.secret, oldKey);
			const encrypted = Auth.encryptToken(decrypted, this.server.envConfig.encryptionKey);
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
			const encrypted = Auth.encryptToken(decrypted, this.server.envConfig.encryptionKey);
			await this.server.prisma.file.update({ where: { id_domain: { domain: this.domain, id: file.id } }, data: { password: encrypted } });
		}

		const bins = await this.server.prisma.file.findMany({ where: { domain: this.domain } });
		for await (const bin of bins) {
			if (!bin.password) continue;
			const decrypted = Auth.decryptToken(bin.password, oldKey);
			const encrypted = Auth.encryptToken(decrypted, this.server.envConfig.encryptionKey);
			await this.server.prisma.pastebin.update({ where: { id_domain: { domain: this.domain, id: bin.id } }, data: { password: encrypted } });
		}
	}

	public async update(data: Prisma.DomainUpdateArgs["data"], auditlog = true) {
		const res = await this.server.prisma.domain.update({ where: { domain: this.domain }, data, include: { apiTokens: true } });
		this._parse(res);

		if (auditlog) this.server.adminAuditLogs.register("Update User", `User: ${this.domain} (${res.pathId})`);
		this.auditlogs.maxAge = this.auditlogDuration;
	}

	public async delete() {
		await this.auditlogs.delete();
		await rm(this.filesPath, { recursive: true });
		await rm(this.pastebinPath, { recursive: true });

		await this.server.prisma.file.deleteMany({ where: { domain: this.domain } });
		await this.server.prisma.url.deleteMany({ where: { domain: this.domain } });
		await this.server.prisma.token.deleteMany({ where: { domain: this.domain } });
		await this.server.prisma.domain.delete({ where: { domain: this.domain } });
		await this.server.prisma.pastebin.deleteMany({ where: { domain: this.domain } });

		this.storageCheckCron.stop();
		this.storageSyncCron.stop();
	}

	public async resetAuth() {
		const res = await this.server.prisma.domain.update({
			where: { domain: this.domain },
			data: { password: null, twoFactorSecret: null, backupCodes: "paperplane-cdn" },
			include: { apiTokens: true }
		});

		this._parse(res);
	}

	public async removeCode(code: string) {
		this.codes = this.codes.filter((c) => c !== code);
		const res = await this.server.prisma.domain.update({
			where: { domain: this.domain },
			data: { password: null, twoFactorSecret: null, backupCodes: this.codes.join(",") },
			include: { apiTokens: true }
		});

		this._parse(res);
	}

	public async createToken(name: string) {
		const token = await this.server.prisma.token.create({ data: { domain: this.domain, name, token: Auth.generateToken(32) } });
		this.apiTokens.push(token);

		return token;
	}

	public async deleteTokens(tokens: string[]) {
		await this.server.prisma.token.deleteMany({ where: { name: { in: tokens } } });
		const res = await this.server.prisma.token.findMany({ where: { domain: this.domain } });
		this.apiTokens = res;
	}

	public async addFile(file: Express.Multer.File, name?: string | undefined, password?: string): Promise<string> {
		const id = name || Utils.generateId(this.nameStrategy, this.nameLength) || file.originalname.split(".")[0];
		const fileExt = file.filename.split(".").filter(Boolean).slice(1).join(".");

		const authBuffer = Buffer.from(`${Auth.generateToken(32)}.${Date.now()}.${this.domain}.${id}`).toString("base64");
		const authSecret = Auth.encryptToken(authBuffer, this.server.envConfig.encryptionKey);

		const fileData = await this.server.prisma.file.create({
			data: {
				id,
				authSecret,
				date: new Date(),
				mimeType: file.mimetype,
				domain: this.domain,
				path: join(this.filesPath, file.filename),
				size: this.server.config.parseStorage(file.size),
				password: password ? Auth.encryptPassword(password, this.server.envConfig.encryptionKey) : undefined
			}
		});

		const filename = `${fileData.id}${this.nameStrategy === "zerowidth" ? "" : `.${fileExt}`}`;
		this.auditlogs.register("File Upload", `File: ${filename}, size: ${this.server.config.parseStorage(file.size)}`);
		return filename;
	}

	public async registerUpload(file: File, options: { name?: string; password?: string; visible?: boolean } = {}): Promise<string> {
		const fileExt = file.newFilename.split(".").filter(Boolean).slice(1).join(".");
		const id =
			options.name ||
			Utils.generateId(this.nameStrategy, this.nameLength) ||
			file.originalFilename?.split(".")[0] ||
			Utils.generateId("id", 32)!;

		const authBuffer = Buffer.from(`${Auth.generateToken(32)}.${Date.now()}.${this.domain}.${id}`).toString("base64");
		const authSecret = Auth.encryptToken(authBuffer, this.server.envConfig.encryptionKey);

		const fileData = await this.server.prisma.file.create({
			data: {
				id: this.nameStrategy === "zerowidth" ? id : `${id}.${fileExt}`,
				authSecret,
				date: new Date(),
				mimeType: file.mimetype!,
				domain: this.domain,
				visible: options.visible,
				path: join(this.filesPath, file.newFilename),
				size: this.server.config.parseStorage(file.size),
				password: options.password ? Auth.encryptPassword(options.password, this.server.envConfig.encryptionKey) : undefined
			}
		});

		this.auditlogs.register("File Upload", `File: ${fileData.id}, size: ${this.server.config.parseStorage(file.size)}`);
		return fileData.id;
	}

	public addView(id: string) {
		this.views.push(id);

		if (!this.viewTimeout) {
			const timeout = setTimeout(async () => {
				const _views = new Collection<string, number>();
				this.views.forEach((view) => _views.set(view, (_views.get(view) ?? 0) + 1));
				for await (const [key, amount] of _views) {
					await this.server.prisma.file
						.update({
							where: { id_domain: { domain: this.domain, id: key } },
							data: { views: { increment: amount } }
						})
						.catch(() => void 0); // 99% of the errors come from deleted items
				}

				this.views = [];
				this.viewTimeout = undefined;
			}, 3e4);

			this.viewTimeout = timeout;
		}
	}

	public addVisit(id: string) {
		this.visits.push(id);

		if (!this.visitTimeout) {
			const timeout = setTimeout(async () => {
				const _visits = new Collection<string, number>();
				this.visits.forEach((visit) => _visits.set(visit, (_visits.get(visit) ?? 0) + 1));

				for await (const [key, amount] of _visits) {
					await this.server.prisma.url
						.update({
							where: { id_domain: { domain: this.domain, id: key } },
							data: { visits: { increment: amount } }
						})
						.catch(() => void 0); // 99% of the errors come from deleted items
				}

				this.visits = [];
				this.visitTimeout = undefined;
			}, 3e4);

			this.visitTimeout = timeout;
		}
	}

	public addRead(id: string) {
		this.reads.push(id);

		if (!this.readTimeout) {
			const timeout = setTimeout(async () => {
				const _reads = new Collection<string, number>();
				this.reads.forEach((visit) => _reads.set(visit, (_reads.get(visit) ?? 0) + 1));

				for await (const [key, amount] of _reads) {
					await this.server.prisma.pastebin
						.update({
							where: { id_domain: { domain: this.domain, id: key } },
							data: { views: { increment: amount } }
						})
						.catch(() => void 0); // 99% of the errors come from deleted items
				}

				this.reads = [];
				this.readTimeout = undefined;
			}, 3e4);

			this.readTimeout = timeout;
		}
	}

	public toString() {
		return this.domain;
	}

	public toJSON() {
		return {
			domain: this.domain,
			date: this.date,
			disabled: this.disabled,
			extensions: this.extensions,
			extensionsMode: this.extensionsMode,
			maxStorage: this.maxStorage,
			storage: this.storage,
			uploadSize: this.uploadSize
		};
	}

	private _parse(data: iDomain) {
		this.domain = data.domain;
		this.date = data.date;

		this.pathId = data.pathId;
		this.filesPath = join(process.cwd(), "..", "..", "data", "files", data.pathId);
		this.pastebinPath = join(process.cwd(), "..", "..", "data", "paste-bins", data.pathId);
		this.disabled = data.disabled;

		this.uploadSize = this.server.config.parseStorage(data.maxUploadSize);
		this.maxStorage = this.server.config.parseStorage(data.maxStorage);
		this.auditlogDuration = ms(data.auditlogDuration);

		this.extensions = data.extensionsList.split(",");
		this.extensionsMode = data.extensionsMode as "block" | "pass";

		this.nameLength = data.nameLength;
		this.nameStrategy = ["zerowidth", "name", "id"].includes(data.nameStrategy) ? (data.nameStrategy as "id" | "zerowidth" | "name") : "id";

		this.embedTitle = data.embedTitle.slice(0, 256);
		this.embedDescription = data.embedDescription.slice(0, 4096);
		this.embedColor = Utils.checkColor(data.embedColor) ? data.embedColor : "#000";
		this.embedEnabled = data.embedEnabled;

		this.secret = (this.server.envConfig.authMode === "2fa" ? data.twoFactorSecret : data.password) ?? "";
		this.codes = data.backupCodes.split(",");
		this.apiTokens = data.apiTokens;
	}

	private syncStorage() {
		const syncFnFile = async () => {
			if (!existsSync(this.filesPath)) await mkdir(this.filesPath);
			const filesInDir = await readdir(this.filesPath).catch<string[]>(() => []);
			const filesInDb = (await this.server.prisma.file.findMany({ where: { domain: this.domain } })).map(
				(file) => file.path.split("/").reverse()[0]
			);

			const missingInDb = filesInDir.filter((file) => !filesInDb.includes(file));
			const missingInDir = filesInDb.filter((file) => !filesInDir.includes(file));

			for (const file of missingInDb) {
				await rm(join(this.filesPath, file));
			}

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

			for (const file of missingInDb) {
				await rm(join(this.pastebinPath, file));
			}

			await this.server.prisma.pastebin.deleteMany({
				where: { domain: this.domain, path: { in: missingInDir.map((id) => join(this.pastebinPath, id)) } }
			});
		};

		const syncFn = async () => {
			await syncFnFile();
			await syncFnBin();
		};

		void syncFn();
		const cron = new CronJob("*/10 * * * *", syncFn);
		this.storageSyncCron = cron;
		cron.start();
	}

	private recordStorage() {
		const updateStorageUsage = async () => {
			const res = await Utils.sizeOfDir(this.filesPath);
			this.storage = res;
		};

		void updateStorageUsage();
		const cron = new CronJob("* * * * *", updateStorageUsage);
		this.storageCheckCron = cron;
		cron.start();
	}
}

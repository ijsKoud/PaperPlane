import type Server from "../../Server.js";
import type { Domain as DomainInterface, Token, Prisma } from "@prisma/client";
import { Utils } from "../utils.js";
import { join } from "node:path";
import ms from "ms";
import { mkdir, rm } from "node:fs/promises";
import { AuditLog } from "../AuditLog.js";
import { Auth } from "../Auth.js";

type iDomain = DomainInterface & {
	apiTokens: Token[];
};

export class Domain {
	public domain!: string;
	public date!: Date;

	public filesPath!: string;
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
	private storageCheckTimeout!: NodeJS.Timeout;

	public constructor(public server: Server, data: iDomain) {
		this._parse(data);
		this.auditlogs = new AuditLog(server, this.domain, this.auditlogDuration);
	}

	public async start() {
		this.recordStorage();
		await this.auditlogs.start();
	}

	public async reset() {
		await rm(this.filesPath, { recursive: true });
		await mkdir(this.filesPath, { recursive: true });

		await this.server.prisma.file.deleteMany({ where: { domain: this.domain } });
		await this.server.prisma.url.deleteMany({ where: { domain: this.domain } });
		await this.server.prisma.token.deleteMany({ where: { domain: this.domain } });

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

	public async update(data: Prisma.DomainUpdateArgs["data"], auditlog = true) {
		const res = await this.server.prisma.domain.update({ where: { domain: this.domain }, data, include: { apiTokens: true } });
		this._parse(res);

		if (auditlog) this.server.adminAuditLogs.register("Update User", `User: ${this.domain} (${res.pathId})`);
		this.auditlogs.maxAge = this.auditlogDuration;
	}

	public async delete() {
		await this.auditlogs.delete();
		await rm(this.filesPath, { recursive: true });

		await this.server.prisma.file.deleteMany({ where: { domain: this.domain } });
		await this.server.prisma.url.deleteMany({ where: { domain: this.domain } });
		await this.server.prisma.token.deleteMany({ where: { domain: this.domain } });
		await this.server.prisma.domain.delete({ where: { domain: this.domain } });

		clearTimeout(this.storageCheckTimeout);
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

	public async addFile(file: Express.Multer.File): Promise<string> {
		const id = Utils.generateId(this.nameStrategy, this.nameLength) || file.originalname.split(".")[0];
		const fileExt = file.filename.split(".").filter(Boolean).slice(1).join(".");
		const fileData = await this.server.prisma.file.create({
			data: {
				id,
				date: new Date(),
				path: join(this.filesPath, file.filename),
				size: this.server.config.parseStorage(file.size),
				domain: this.domain
			}
		});

		const filename = `${fileData.id}${this.nameStrategy === "zerowidth" ? "" : `.${fileExt}`}`;
		this.auditlogs.register("File Upload", `File: ${filename}, size: ${this.server.config.parseStorage(file.size)}`);
		return filename;
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

		this.filesPath = join(process.cwd(), "..", "..", "data", "files", data.pathId);
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

	private recordStorage() {
		const updateStorageUsage = async () => {
			const res = await Utils.sizeOfDir(this.filesPath);
			this.storage = res;
		};

		void updateStorageUsage();
		const timeout = setTimeout(() => void updateStorageUsage(), 6e4);
		this.storageCheckTimeout = timeout;
	}
}

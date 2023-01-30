import type Server from "../../Server.js";
import type { Domain as DomainInterface, Token, Prisma } from "@prisma/client";
import { Utils } from "../utils.js";
import { join } from "node:path";
import ms from "ms";
import { rm } from "node:fs/promises";
import { AuditLog } from "../AuditLog.js";

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

	public auditlogs: AuditLog;
	private storageCheckTimeout!: NodeJS.Timeout;

	public constructor(public server: Server, data: iDomain) {
		this._parse(data);
		this.recordStorage();
		this.auditlogs = new AuditLog(server, this.domain);
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

	public async update(data: Prisma.DomainUpdateArgs["data"]) {
		const res = await this.server.prisma.domain.update({ where: { domain: this.domain }, data, include: { apiTokens: true } });
		this._parse(res);

		this.server.adminAuditLogs.register("Update User", `User: ${this.domain} (${res.pathId})`);
	}

	public async delete() {
		await this.auditlogs.delete();
		await this.server.prisma.domain.delete({ where: { domain: this.domain } });
		await rm(this.filesPath, { recursive: true });

		clearTimeout(this.storageCheckTimeout);
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

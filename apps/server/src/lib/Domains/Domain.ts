import type Server from "../../Server.js";
import type { Domain as iDomain, Prisma } from "@prisma/client";
import { Utils } from "../utils.js";
import { join } from "node:path";

export class Domain {
	public domain!: string;
	public date!: Date;

	public filesPath!: string;
	public disabled!: boolean;

	public uploadSize!: number;
	public maxStorage!: number;
	public storage = 0;

	public extensions!: string[];
	public extensionsMode!: "block" | "pass";

	public secret!: string;
	public codes!: string[];

	public constructor(public server: Server, data: iDomain) {
		this._parse(data);
		this.recordStorage();
	}

	public async update(data: Prisma.DomainUpdateArgs["data"]) {
		const res = await this.server.prisma.domain.update({ where: { domain: this.domain }, data });
		this._parse(res);
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

		this.extensions = data.extensionsList.split(",");
		this.extensionsMode = data.extensionsMode as "block" | "pass";

		this.secret = (this.server.envConfig.authMode === "2fa" ? data.twoFactorSecret : data.password) ?? "";
		this.codes = data.backupCodes.split(",");
	}

	private recordStorage() {
		const updateStorageUsage = async () => {
			const res = await Utils.sizeOfDir(this.filesPath);
			this.storage = res;
		};

		void updateStorageUsage();
		setTimeout(() => void updateStorageUsage(), 6e4);
	}
}

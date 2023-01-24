import type Server from "../../Server.js";
import type { Domain as iDomain } from "@prisma/client";
import { Utils } from "../utils.js";
import { join } from "node:path";

export class Domain {
	public domain: string;
	public filesPath: string;
	public disabled: boolean;

	public uploadSize: number;
	public maxStorage: number;
	public storage = 0;

	public extensions: string[];
	public extensionsMode: "block" | "pass";

	public secret: string;
	public codes: string[];

	public constructor(public server: Server, data: iDomain) {
		this.domain = data.domain;
		this.filesPath = join(process.cwd(), "..", "..", data.domain);
		this.disabled = data.disabled;

		this.uploadSize = this.server.config.parseStorage(data.maxUploadSize);
		this.maxStorage = this.server.config.parseStorage(data.maxStorage);

		this.extensions = data.extensionsList.split(",");
		this.extensionsMode = data.extensionsMode as "block" | "pass";

		this.secret = (server.envConfig.authMode === "2fa" ? data.twoFactorSecret : data.password) ?? "";
		this.codes = data.backupCodes.split(",");

		this.recordStorage();
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

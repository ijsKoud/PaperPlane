import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { config } from "dotenv";
import type Server from "../Server.js";
import { bold } from "colorette";
import { Auth } from "./Auth.js";
import { ConfigNames, type EnvConfig, type RawEnvConfig } from "./types.js";
import ms from "ms";
import { Utils } from "./utils.js";
import { lookup } from "mime-types";
import { Logger } from "@snowcrystals/icicle";
import { readFileSync, writeFileSync } from "node:fs";

const DEFAULT_CONFIG: RawEnvConfig = {
	ENCRYPTION_KEY: "{0}",
	INTERNAL_API_KEY: "{1}",
	ADMIN_2FA_KEY: "{2}",
	AUTH_MODE: "2fa",
	SIGNUP_MODE: "closed",
	MAX_STORAGE: "0",
	MAX_UPLOAD_SIZE: "0",
	AUDIT_LOG_DURATION: "31d",
	EXTENSIONS_MODE: "block",
	EXTENSIONS_LIST: [] as string[],
	INSECURE_REQUESTS: "false",
	PORT: "3000"
} as const;

export default class Config {
	public constructor(public server: Server) {}

	public async start() {
		const dataDir = join(process.cwd(), "..", "..", "data");
		await mkdir(join(dataDir, "logs"), { recursive: true });
		await mkdir(join(dataDir, "files"), { recursive: true });
		await mkdir(join(dataDir, "paste-bins"), { recursive: true });
		await mkdir(join(dataDir, "backups", "archives"), { recursive: true });
		await mkdir(join(dataDir, "backups", "temp"), { recursive: true });

		await this.updateFiles();
		const config = Config.getEnv();
		await Config.updateEnv(config);
	}

	/**
	 * Updates the env config
	 * @param config The settings to change
	 */
	public async update(config: Partial<Omit<EnvConfig, "encryptionKey" | "internalApiKey" | "admin2FASecret" | "port" | "insecureRequests">>) {
		const updatedConfig = {
			...Config.getEnv(),
			maxStorage: Config.parseConfigItem("MAX_STORAGE", config.maxStorage?.toString()),
			maxUpload: Config.parseConfigItem("MAX_UPLOAD_SIZE", config.maxUpload?.toString()),
			auditLogDuration: Config.parseConfigItem("AUDIT_LOG_DURATION", config.auditLogDuration?.toString()),
			authMode: Config.parseConfigItem("AUTH_MODE", config.authMode),
			signUpMode: Config.parseConfigItem("SIGNUP_MODE", config.signUpMode),
			extensionsList: Config.parseConfigItem("EXTENSIONS_LIST", config.extensionsList?.join(",")),
			extensionsMode: Config.parseConfigItem("EXTENSIONS_MODE", config.extensionsMode)
		};

		await Config.updateEnv(updatedConfig);
	}

	/** Changes the encryption key */
	public async resetEncryptionKey() {
		const config = Config.getEnv();
		const oldKey = config.encryptionKey;

		config.encryptionKey = Auth.generateToken(32);
		await Config.updateEnv(config);

		await this.server.domains.resetEncryption(oldKey);
		this.server.logger.info("[CONFIG]: Encryption key reset initiated");
		this.server.adminAuditLogs.register("Encryption Reset", "N/A");
	}

	private async updateFiles() {
		const files = await this.server.prisma.file.findMany();
		let count = 0;
		let extensionCount = 0;

		for await (const file of files) {
			if (file.mimeType.length) continue;

			const filename = file.path.split("/").reverse()[0];
			const mimeType = lookup(filename);
			await this.server.prisma.file.update({ where: { id_domain: { id: file.id, domain: file.domain } }, data: { mimeType: mimeType || "" } });
			count++;
		}

		for await (const file of files) {
			if (file.id.includes(".") || ["\u200B", "\u2060", "\u200C", "\u200D"].some((str) => file.id.includes(str))) continue;

			const filename = file.path.split("/").reverse()[0];
			const fileExt = filename.split(".").slice(1).filter(Boolean).join(".");
			await this.server.prisma.file.update({
				where: { id_domain: { id: file.id, domain: file.domain } },
				data: { id: `${file.id}.${fileExt}` }
			});
			extensionCount++;
		}

		this.server.logger.info(`[CONFIG]: Updated mime-types for ${count} files`);
		this.server.logger.info(`[CONFIG]: Updated extensions for ${extensionCount} files`);
	}

	public static logger = new Logger({ name: "CONFIG" });

	public static get VERSION(): string {
		const file = readFileSync(join(process.cwd(), "..", "..", "package.json"), "utf-8");
		const { version } = JSON.parse(file);

		return version;
	}

	/**
	 * Updates the enivornment variables file with the provided config
	 * @param config The updated configuration
	 */
	public static async updateEnv(config: EnvConfig) {
		const getCleanKey = (key: keyof EnvConfig) => {
			const configKey = ConfigNames[key];
			let value = config[key] ?? "";

			switch (key) {
				case "auditLogDuration":
					value = ms((value as number) || 0) ?? DEFAULT_CONFIG.AUDIT_LOG_DURATION;
					break;
				case "extensionsList":
					value = (value as string[]).join(",");
					break;
				case "maxStorage":
				case "maxUpload":
					value = Utils.parseStorage(value as number);
					break;
				default:
					break;
			}

			return `${configKey}="${value}"`;
		};

		const envConfig = Object.keys(config)
			.map((key) => getCleanKey(key as keyof EnvConfig))
			.join("\n");

		const dataDir = join(process.cwd(), "..", "..", "data");
		await writeFile(join(dataDir, ".env"), envConfig);
	}

	/** Generates the default configuration every PaperPlane instance is shipped with */
	public static getDefaultConfig() {
		const encryptionKey = Auth.generateToken(32);
		const internalApiKey = Auth.generateToken(64);
		const { uri, secret: admin2fa } = Auth.generate2FASecret();

		let config = Object.keys(DEFAULT_CONFIG)
			.map((key) => `${key}="${DEFAULT_CONFIG[key as keyof RawEnvConfig]}"`)
			.join("\n");
		[encryptionKey, internalApiKey, admin2fa].forEach((value, key) => (config = config.replace(`{${key}}`, value)));

		const qrCodeUrl = bold(`https://chart.googleapis.com/chart?chs=166x166&chld=L|0&cht=qr&chl=${encodeURIComponent(uri)}`);
		this.logger.info(`Generating new config with Admin 2fa key. To add it to your account, use the following QR-CODE: ${qrCodeUrl}`);

		return config;
	}

	/**
	 * Parses the environment variable value into a valid JavaScript value
	 * @param key The field key
	 * @param value The field data
	 * @returns
	 */
	public static parseConfigItem(key: keyof RawEnvConfig, value?: string): any {
		if (!value) value = process.env[key];

		switch (key) {
			case "ENCRYPTION_KEY":
				if (value && value.length === 32) return value;
				return Auth.generateToken(32);
			case "INTERNAL_API_KEY":
				if (value && value.length === 64) return value;
				return Auth.generateToken(64);
			case "ADMIN_2FA_KEY":
				if (!value || !Auth.check2FASecret(value)) {
					const tfaSecret = Auth.generate2FASecret();
					const qrCodeUrl = `https://chart.googleapis.com/chart?chs=166x166&chld=L|0&cht=qr&chl=${encodeURIComponent(tfaSecret.uri)}`;
					this.logger.warn(
						`Invalid ADMIN_2FA_KEY found in the ${bold(".env")} file, continuing with new key ${bold(
							qrCodeUrl
						)}. Please restore your old 2FA key or add the new key to the 2FA Authenticator App!`
					);

					return tfaSecret.secret;
				}

				return value;
			case "AUTH_MODE":
				if (!value || !["2fa", "password"].includes(value)) return DEFAULT_CONFIG.AUTH_MODE;
				return value;
			case "SIGNUP_MODE":
				if (!value || !["closed", "open", "invite"].includes(value)) return DEFAULT_CONFIG.SIGNUP_MODE;
				return value;
			case "AUDIT_LOG_DURATION": {
				const parsedDuration = ms(value || "undefined");
				if (!value || isNaN(parsedDuration)) return ms(DEFAULT_CONFIG.AUDIT_LOG_DURATION);
				return parsedDuration;
			}
			case "MAX_STORAGE":
				return Utils.parseStorage(value ?? "0 B");
			case "MAX_UPLOAD_SIZE":
				return Utils.parseStorage(value ?? "0 B");
			case "EXTENSIONS_MODE":
				if (!value || !["pass", "block"].includes(value)) return DEFAULT_CONFIG.EXTENSIONS_MODE;
				return value;
			case "EXTENSIONS_LIST": {
				const v = value ?? "";
				const array = v.split(",");
				const filtered = array.filter((extension) => extension.startsWith("."));

				return filtered;
			}
			case "INSECURE_REQUESTS":
				return value === "true" ? true : false;
			case "PORT": {
				const v = Number(value);
				if (isNaN(v)) return 3e3;

				return v;
			}
			default:
				return "";
		}
	}

	/**
	 * Parses the environment variable file and returns usable data
	 * @param dir The dir the file is located in
	 */
	public static parseEnv(dir: string): EnvConfig {
		const path = join(dir, ".env");
		const { error } = config({ path });

		if (error) {
			switch ((error as NodeJS.ErrnoException).code) {
				case "ENOENT":
					{
						this.logger.warn(`No ${bold(".env")} found, creating one with the default configuration`);

						const newConfig = this.getDefaultConfig();
						writeFileSync(path, newConfig);
						config({ path });
					}
					break;
				default:
					this.logger.fatal(`Unexpected error occured while loading the ${bold(".env")} config. PATH=${path} ERROR=`, error);
			}
		}

		const envConfig = {
			encryptionKey: this.parseConfigItem("ENCRYPTION_KEY"),
			internalApiKey: this.parseConfigItem("INTERNAL_API_KEY"),
			admin2FASecret: this.parseConfigItem("ADMIN_2FA_KEY"),
			maxStorage: this.parseConfigItem("MAX_STORAGE"),
			maxUpload: this.parseConfigItem("MAX_UPLOAD_SIZE"),
			auditLogDuration: this.parseConfigItem("AUDIT_LOG_DURATION"),
			authMode: this.parseConfigItem("AUTH_MODE"),
			signUpMode: this.parseConfigItem("SIGNUP_MODE"),
			extensionsList: this.parseConfigItem("EXTENSIONS_LIST"),
			extensionsMode: this.parseConfigItem("EXTENSIONS_MODE"),
			insecureRequests: this.parseConfigItem("INSECURE_REQUESTS"),
			port: this.parseConfigItem("PORT")
		} satisfies EnvConfig;

		return envConfig;
	}

	public static getEnv() {
		const path = join(process.cwd(), "..", "..", "data");
		return this.parseEnv(path);
	}
}

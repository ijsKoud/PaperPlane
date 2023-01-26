import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { config } from "dotenv";
import type Server from "../Server.js";
import { bold } from "colorette";
import { Auth } from "./Auth.js";
import { ConfigNames, EnvConfig, RawEnvConfig } from "./types.js";
import ms from "ms";

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

export class Config {
	public config!: EnvConfig;

	public constructor(public server: Server) {}

	public async start() {
		const dataDir = join(process.cwd(), "..", "..", "data");
		await mkdir(join(dataDir, "logs"), { recursive: true });
		await mkdir(join(dataDir, "files"), { recursive: true });

		const { error } = config({ path: join(dataDir, ".env") });

		if (error) {
			switch ((error as NodeJS.ErrnoException).code) {
				case "ENOENT":
					{
						this.server.logger.error(`[CONFIG]: No ${bold(".env")} found, creating one with the default configuration`);

						const newConfig = this.generateDefaultConfig();
						await writeFile(join(dataDir, ".env"), newConfig);

						config({ path: join(dataDir, ".env") });
					}
					break;
				default:
					this.server.logger.fatal(`[CONFIG]: unexpected error occured while loading the ${bold(".env")} config.`, error);
			}
		}

		this.config = {
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
		};

		await this.triggerUpdate();
	}

	public async update(config: Partial<Omit<EnvConfig, "encryptionKey" | "internalApiKey" | "admin2FASecret" | "PORT" | "INSECURE_REQUESTS">>) {
		this.config = {
			...this.config,
			maxStorage: this.parseConfigItem(config.maxStorage?.toString() || "MAX_STORAGE"),
			maxUpload: this.parseConfigItem(config.maxUpload?.toString() || "MAX_UPLOAD_SIZE"),
			auditLogDuration: this.parseConfigItem(config.auditLogDuration?.toString() || "AUDIT_LOG_DURATION"),
			authMode: this.parseConfigItem(config.authMode || "AUTH_MODE"),
			signUpMode: this.parseConfigItem(config.signUpMode || "SIGNUP_MODE"),
			extensionsList: this.parseConfigItem(config.extensionsList?.join(",") || "EXTENSIONS_LIST"),
			extensionsMode: this.parseConfigItem(config.extensionsMode || "EXTENSIONS_MODE")
		};

		await this.triggerUpdate();
	}

	public parseStorage(storage: string): number;
	public parseStorage(storage: number): string;
	public parseStorage(storage: string | number): number | string {
		if (typeof storage === "string") {
			const units = ["B", "kB", "MB", "GB", "TB", "PB"];
			const INFINITY = units.map((unit) => `0 ${unit}`);
			if (!storage.length || [INFINITY, "0"].includes(storage)) return 0;

			const [_amount, unit] = storage.split(/ +/g);
			const unitSize = units.indexOf(unit) || 0;

			const amount = Number(_amount);
			if (isNaN(amount)) return 0;

			return amount * Math.pow(1024, unitSize);
		}

		if (storage === Infinity) return "Infinity";

		const units = ["B", "kB", "MB", "GB", "TB", "PB"];
		let num = 0;

		while (storage > 1024) {
			storage /= 1024;
			++num;
		}

		return `${storage.toFixed(1)} ${units[num]}`;
	}

	private parseConfigItem(value: string): any;
	private parseConfigItem(key: keyof RawEnvConfig): any {
		let value: string | undefined;

		if (Boolean(process.env[key])) value = process.env[key];
		else value = key;

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
					this.server.logger.warn(
						`[CONFIG]: Invalid ADMIN_2FA_KEY found in the ${bold(".env")} file, continuing with new key ${bold(
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
				return this.parseStorage(value ?? "0 B");
			case "MAX_UPLOAD_SIZE":
				return this.parseStorage(value ?? "0 B");
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

	private generateDefaultConfig() {
		const encryptionKey = Auth.generateToken(32);
		const internalApiKey = Auth.generateToken(64);
		const { uri, secret: admin2fa } = Auth.generate2FASecret();

		let config = Object.keys(DEFAULT_CONFIG)
			.map((key) => `${key}="${DEFAULT_CONFIG[key as keyof RawEnvConfig]}"`)
			.join("\n");
		[encryptionKey, internalApiKey, admin2fa].forEach((value, key) => (config = config.replace(`{${key}}`, value)));

		const qrCodeUrl = bold(`https://chart.googleapis.com/chart?chs=166x166&chld=L|0&cht=qr&chl=${encodeURIComponent(uri)}`);
		this.server.logger.info(
			`[CONFIG]: Generating new config with Admin 2fa key. To add it to your account, use the following QR-CODE: ${qrCodeUrl}`
		);

		return config;
	}

	private async triggerUpdate() {
		const getCleanKey = (key: keyof EnvConfig) => {
			const configKey = ConfigNames[key];
			let value = this.config[key] ?? "";

			switch (key) {
				case "auditLogDuration":
					value = ms((value as number) || 0) ?? DEFAULT_CONFIG.AUDIT_LOG_DURATION;
					break;
				case "extensionsList":
					value = (value as string[]).join(",");
					break;
				case "maxStorage":
				case "maxUpload":
					value = this.parseStorage(value as number);
					break;
				default:
					break;
			}

			return `${configKey}="${value}"`;
		};

		const config = Object.keys(this.config)
			.map((key) => getCleanKey(key as keyof EnvConfig))
			.join("\n");

		const dataDir = join(process.cwd(), "..", "..", "data");
		await writeFile(join(dataDir, ".env"), config);
	}
}

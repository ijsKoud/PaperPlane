import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { config } from "dotenv";
import type Server from "../Server.js";
import { bold } from "colorette";
import { Auth } from "./Auth.js";
import type { EnvConfig, RawEnvConfig } from "./types.js";
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
	EXTENSIONS_LIST: [] as string[]
} as const;

export class Config {
	public config!: EnvConfig;

	public constructor(public server: Server) {}

	public async start() {
		const dataDir = join(process.cwd(), "..", "..", "data");
		const { error } = config({ path: join(dataDir, ".env") });

		if (error) {
			switch ((error as NodeJS.ErrnoException).code) {
				case "ENOENT":
					{
						this.server.logger.error(`[CONFIG]: No ${bold(".env")} found, creating one with the default configuration`);

						const newConfig = this.generateDefaultConfig();
						await writeFile(join(dataDir, ".env"), newConfig);
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
			extensionsMode: this.parseConfigItem("EXTENSIONS_MODE")
		};
	}

	public parseStorage(storage: string): number {
		const units = ["B", "kB", "MB", "GB", "TB", "PB"];
		const INFINITY = units.map((unit) => `0 ${unit}`);
		if (!storage.length || [INFINITY, "0"].includes(storage)) return 0;

		const [_amount, unit] = storage.split(/ +/g);
		const unitSize = (units.indexOf(unit) || 0) + 1;
		const amount = Number(_amount);
		if (isNaN(amount)) return 0;

		return amount * unitSize;
	}

	private parseConfigItem(key: keyof RawEnvConfig): any {
		const value = process.env[key];

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

					// this.triggerUpdate();
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
			default:
				return "";
		}
	}

	private generateDefaultConfig() {
		const encryptionKey = Auth.generateToken(32);
		const internalApiKey = Auth.generateToken(64);
		const { uri, secret: admin2fa } = Auth.generate2FASecret();

		let config = Object.keys(DEFAULT_CONFIG)
			// eslint-disable-next-line @typescript-eslint/no-invalid-this
			.map((key) => `${key}="${DEFAULT_CONFIG[key as keyof RawEnvConfig]}"`)
			.join("\n");
		[encryptionKey, internalApiKey, admin2fa].forEach((value, key) => (config = config.replace(`{${key}}`, value)));

		const qrCodeUrl = bold(`https://chart.googleapis.com/chart?chs=166x166&chld=L|0&cht=qr&chl=${encodeURIComponent(uri)}`);
		this.server.logger.info(
			`[CONFIG]: Generating new config with Admin 2fa key. To add it to your account, use the following QR-CODE: ${qrCodeUrl}`
		);

		return config;
	}
}

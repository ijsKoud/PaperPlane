export interface RawEnvConfig {
	ENCRYPTION_KEY: string;
	INTERNAL_API_KEY: string;
	ADMIN_2FA_KEY: string;

	AUTH_MODE: AuthMode;
	SIGNUP_MODE: SignUpMode;

	MAX_STORAGE: string;
	MAX_UPLOAD_SIZE: string;
	AUDIT_LOG_DURATION: string;

	EXTENSIONS_MODE: ExtensionsMode;
	EXTENSIONS_LIST: string[];
}

export interface EnvConfig {
	encryptionKey: string;
	internalApiKey: string;
	admin2FASecret: string;

	authMode: AuthMode;
	signUpMode: SignUpMode;

	maxStorage: number;
	maxUpload: number;
	auditLogDuration: string;

	extensionsMode: ExtensionsMode;
	extensionsList: string[];
}

export type SignUpMode = "open" | "closed" | "invite";
export type AuthMode = "2fa" | "password";
export type ExtensionsMode = "block" | "pass";

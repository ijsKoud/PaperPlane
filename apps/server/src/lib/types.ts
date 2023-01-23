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

	INSECURE_REQUESTS: string;
	PORT: string;
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

	insecureRequests: boolean;
	port: number;
}

export const ConfigNames = {
	encryptionKey: "ENCRYPTION_KEY",
	internalApiKey: "INTERNAL_API_KEY",
	admin2FASecret: "ADMIN_2FA_KEY",

	authMode: "AUTH_MODE",
	signUpMode: "SIGNUP_MODE",

	maxStorage: "MAX_STORAGE",
	maxUpload: "MAX_UPLOAD_SIZE",
	auditLogDuration: "AUDIT_LOG_DURATION",

	extensionsMode: "EXTENSIONS_MODE",
	extensionsList: "EXTENSIONS_LIST",

	insecureRequests: "INSECURE_REQUESTS",
	port: "PORT"
} as const;

export type SignUpMode = "open" | "closed" | "invite";
export type AuthMode = "2fa" | "password";
export type ExtensionsMode = "block" | "pass";

export type RequestMethods = "get" | "put" | "post" | "patch" | "delete" | "head" | "options";

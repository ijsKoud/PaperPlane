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
	auditLogDuration: number;

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

export enum AdminUserSort {
	DATE_NEW_OLD,
	DATE_OLD_NEW,
	USAGE_HIGH_LOW,
	USAGE_LOW_HIGH,
	LIMIT_HIGH_LOW,
	LIMIT_LOW_HIGH,
	NAME_A_Z,
	NAME_Z_A
}
export const AdminUserSortNames = {
	[AdminUserSort.DATE_NEW_OLD]: "Date: new - old",
	[AdminUserSort.DATE_OLD_NEW]: "Date: old - new",
	[AdminUserSort.USAGE_HIGH_LOW]: "Storage Usage: high - low",
	[AdminUserSort.USAGE_LOW_HIGH]: "Storage Usage: low - high",
	[AdminUserSort.LIMIT_HIGH_LOW]: "Storage Limit: high - low",
	[AdminUserSort.LIMIT_LOW_HIGH]: "Storage Limit: low - high",
	[AdminUserSort.NAME_A_Z]: "Name: A - Z",
	[AdminUserSort.NAME_Z_A]: "Name: Z - A"
} as const;

export enum FilesSort {
	DATE_NEW_OLD,
	DATE_OLD_NEW,
	VIEWS_HIGH_LOW,
	VIEWS_LOW_HIGH,
	SIZE_LARGE_SMALL,
	SIZE_SMALL_LARGE,
	NAME_A_Z,
	NAME_Z_A
}

export enum UrlsSort {
	DATE_NEW_OLD,
	DATE_OLD_NEW,
	VISITS_HIGH_LOW,
	VISITS_LOW_HIGH,
	NAME_A_Z,
	NAME_Z_A
}

export enum BinSort {
	DATE_NEW_OLD,
	DATE_OLD_NEW,
	VIEWS_HIGH_LOW,
	VIEWS_LOW_HIGH,
	NAME_A_Z,
	NAME_Z_A
}

export const FilesSortNames = {
	[FilesSort.DATE_NEW_OLD]: "Date: new - old",
	[FilesSort.DATE_OLD_NEW]: "Date: old - new",
	[FilesSort.VIEWS_HIGH_LOW]: "Views: high - low",
	[FilesSort.VIEWS_LOW_HIGH]: "Views: low - high",
	[FilesSort.SIZE_LARGE_SMALL]: "Size: large - small",
	[FilesSort.SIZE_SMALL_LARGE]: "Size: small - large",
	[FilesSort.NAME_A_Z]: "Name: A - Z",
	[FilesSort.NAME_Z_A]: "Name: Z - A"
} as const;

export const ShortUrlsSortNames = {
	[UrlsSort.DATE_NEW_OLD]: "Date: new - old",
	[UrlsSort.DATE_OLD_NEW]: "Date: old - new",
	[UrlsSort.VISITS_HIGH_LOW]: "Visits: high - low",
	[UrlsSort.VISITS_LOW_HIGH]: "Visits: low - high",
	[UrlsSort.NAME_A_Z]: "Name: A - Z",
	[UrlsSort.NAME_Z_A]: "Name: Z - A"
} as const;

export const BinSortNames = {
	[BinSort.DATE_NEW_OLD]: "Date: new - old",
	[BinSort.DATE_OLD_NEW]: "Date: old - new",
	[BinSort.VIEWS_HIGH_LOW]: "Views: high - low",
	[BinSort.VIEWS_LOW_HIGH]: "Views: low - high",
	[BinSort.NAME_A_Z]: "Name: A - Z",
	[BinSort.NAME_Z_A]: "Name: Z - A"
} as const;

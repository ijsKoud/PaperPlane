import type { NextFunction, Request, Response } from "express";
import type Server from "../Server.js";
import type { Domain } from "./index.js";

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

export type RequestMethods = "get" | "put" | "post" | "patch" | "delete" | "head" | "options";

export type Middleware = (server: Server, req: Request, res: Response, next: NextFunction) => void | Promise<void>;

export interface ApiRoute {
	default: (...args: unknown[]) => void;
	methods: RequestMethods[];
	middleware?: Middleware[];
}

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

export interface CreateUserFormBody {
	domain?: string;
	extension?: string;

	storage: string;
	uploadSize: string;

	extensions: string[];
	extensionsMode: "block" | "pass";

	auditlog: string;
}

export interface UpdateUserFormBody {
	disabled: boolean;
	domains: string[];

	storage: string;
	uploadSize: string;

	extensions: string[];
	extensionsMode: "block" | "pass";

	auditlog: string;
}

export interface UpdateSettingsFormBody {
	authMode: "2fa" | "password";
	signUpMode: "closed" | "open" | "invite";

	storage: string;
	uploadSize: string;

	extensions: string[];
	extensionsMode: "block" | "pass";

	auditlog: string;
}

export interface UpdateDashboardSettingsFormBody {
	nameStrategy: "id" | "zerowidth" | "name";
	nameLength: number;
	embedEnabled: boolean;
}

export interface UpdateDashboardEmbedFormBody {
	title: string;
	description: string;
	color: string;
}

export interface DashboardRequest extends Request {
	locals: {
		domain: Domain;
	};
}

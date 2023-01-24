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

export interface ServiceApi {
	version: string;
	uptime: number;
	users: number;

	authMode: "2fa" | "password";
	signUpMode: "closed" | "open" | "invite";

	storageUsage: number;
	cpuUsage: number;
	memory: {
		total: number;
		usage: number;
	};
}

export interface AuditLogApi {
	entries: AuditLogEntry[];
	pages: number;
}

export interface AuditLogEntry {
	type: string;
	details: string;
	date: Date;
}

export interface UsersApi {
	entries: Domain[];
	pages: number;
}

export interface Domain {
	domain: string;
	date: Date;
	disabled: boolean;

	extensions: string[];
	extensionsMode: "block" | "pass";

	maxStorage: number;
	storage: number;
	uploadSize: number;
}

export const USER_AUTHENTICATION_COOKIE = "PAPERPLANE-AUTH" as const;
export const ADMIN_AUTHENTICATION_COOKIE = "PAPERPLANE-ADMIN" as const;

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

export const TIME_UNITS = [
	{ label: "Seconds", value: "s" },
	{ label: "Minutes", value: "m" },
	{ label: "Days", value: "d" },
	{ label: "Weeks", value: "w" },
	{ label: "Years", value: "y" }
] as const;

export const TIME_UNITS_ARRAY = ["s", "m", "d", "w", "y"] as const;

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
export const BinSortNames = {
	[BinSort.DATE_NEW_OLD]: "Date: new - old",
	[BinSort.DATE_OLD_NEW]: "Date: old - new",
	[BinSort.VIEWS_HIGH_LOW]: "Views: high - low",
	[BinSort.VIEWS_LOW_HIGH]: "Views: low - high",
	[BinSort.NAME_A_Z]: "Name: A - Z",
	[BinSort.NAME_Z_A]: "Name: Z - A"
} as const;

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

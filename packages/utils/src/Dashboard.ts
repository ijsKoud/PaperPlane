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

export interface FilesApiRes {
	entries: ApiFile[];
	pages: number;
}

export interface UrlsApiRes {
	entries: ApiUrl[];
	pages: number;
}

export interface BinApiRes {
	entries: ApiBin[];
	pages: number;
}

export interface ApiFile {
	name: string;
	url: string;

	visible: boolean;
	size: string;
	isImage: boolean;
	ext: string;

	password: boolean;

	date: Date;
	views: number;
}

export interface ApiUrl {
	name: string;
	url: string;
	redirect: string;

	date: Date;
	visible: boolean;
	visits: number;
}

export interface ApiBin {
	name: string;
	url: string;

	visible: boolean;
	highlight: string;

	password: boolean;

	date: Date;
	views: number;
}

export interface DashboardSettingsGetApi {
	nameStrategy: "id" | "zerowidth" | "name";
	nameLength: number;
	embedEnabled: boolean;
	tokens: Token[];
}

export interface Token {
	name: string;
	date: Date;
}

export interface DashboardEmbedGetApi {
	title: string;
	description: string;
	color: string;
}

export interface DashboardStatsGetApi {
	files: number;
	shorturls: number;
	pastebins: number;
	storage: {
		total: number;
		used: number;
	};
}

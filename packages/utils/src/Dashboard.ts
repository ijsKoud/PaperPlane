export enum Sort {
	DATE_NEW_OLD,
	DATE_OLD_NEW,
	VIEWS_HIGH_LOW,
	VIEWS_LOW_HIGH,
	SIZE_LARGE_SMALL,
	SIZE_SMALL_LARGE,
	NAME_A_Z,
	NAME_Z_A
}

export const SortNames = {
	[Sort.DATE_NEW_OLD]: "Date: new - old",
	[Sort.DATE_OLD_NEW]: "Date: old - new",
	[Sort.VIEWS_HIGH_LOW]: "Views: high - low",
	[Sort.VIEWS_LOW_HIGH]: "Views: low - high",
	[Sort.SIZE_LARGE_SMALL]: "Size: large - small",
	[Sort.SIZE_SMALL_LARGE]: "Size: small - large",
	[Sort.NAME_A_Z]: "Name: A - Z",
	[Sort.NAME_Z_A]: "Name: Z - A"
} as const;

export interface FilesApiRes {
	files: ApiFile[];
	pages: number;
}

export interface ApiFile {
	name: string;
	url: string;

	visible: boolean;
	size: number;
	isImage: boolean;

	password: string | null;

	date: Date;
	views: number;
}

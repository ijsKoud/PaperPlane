/* eslint-disable @typescript-eslint/ban-types */
import type { User } from "@prisma/client";
import type React from "react";

export type FC<P = {}> = React.FC<P & { children?: React.ReactNode }>;

export interface ApiError {
	message: string;
	error: string;
}

export interface LoginCreds {
	username: string;
	password: string;
}

export interface LoginFileRes {
	name: string;
	id: string;
	size: string;
	date: Date;
}

export type CleanUser = Omit<User, "password">;

export interface ApiFile {
	name: string;
	url: string;

	visible: boolean;
	size: string;
	isImage: boolean;

	pwdProtection: boolean;
	password: string | null;

	date: Date;
	views: number;
}

export interface ApiURL {
	name: string;
	url: string;
	redirect: string;

	visible: boolean;
	date: Date;
	visits: number;
}

export interface FilesApiRes {
	files: ApiFile[];
	pages: number;
}

export interface URLApiRes {
	urls: ApiURL[];
	pages: number;
}

export interface StatsApi {
	files: {
		bytes: string;
		size: number;
	};
	links: number;
}

export const LINK_SORT_OPTIONS = {
	"date-new": "Date: New - Old",
	"date-old": "Date: Old - New",
	"visits-up": "Visits: High - Low",
	"visits-down": "Visits: Low - High",
	name: "Name: A - Z",
	"name-reverse": "Name: Z - A"
};

export const FILE_SORT_OPTIONS = {
	"date-new": "Date: New - Old",
	"date-old": "Date: Old - New",
	"views-up": "Views: High - Low",
	"views-down": "Views: Low - High",
	"bytes-small": "Size: Large - Small",
	"bytes-large": "Size: Small - Large",
	name: "Name: A - Z",
	"name-reverse": "Name: Z - A"
};

export enum WebsocketMessageType {
	PING,
	INIT,
	USER_UPDATE,
	FILES_UPDATE,
	URL_UPDATE,
	STATS_UPDATE,
	SEARCH_FILE_UPDATE,
	SEARCH_URL_UPDATE
}

export interface WebsocketMessagePing {
	t: WebsocketMessageType.PING;
	d: {};
}

export interface WebsocketMessageInit {
	t: WebsocketMessageType.INIT;
	d: {
		user: CleanUser;
		files: ApiFile[];
		urls: ApiURL[];
		stats: ApiStats;
		pages: {
			files: number;
			urls: number;
		};
	};
}

export interface WebsocketMessageFiles {
	t: WebsocketMessageType.FILES_UPDATE;
	d: {
		files: ApiFile[];
		stats: ApiStats;
		pages: number;
	};
}

export interface WebsocketMessageUrls {
	t: WebsocketMessageType.URL_UPDATE;
	d: {
		urls: ApiURL[];
		stats: ApiStats;
		pages: number;
	};
}

export interface WebsocketMessageUser {
	t: WebsocketMessageType.USER_UPDATE;
	d: {
		user: CleanUser;
	};
}

export interface WebsocketMessageSearch {
	t: WebsocketMessageType.SEARCH_FILE_UPDATE | WebsocketMessageType.SEARCH_URL_UPDATE;
	d: Partial<{
		query: string;
		sortType: string;
		page: number;
	}>;
}

export type WebsocketMessage =
	| WebsocketMessagePing
	| WebsocketMessageInit
	| WebsocketMessageFiles
	| WebsocketMessageUrls
	| WebsocketMessageSearch
	| WebsocketMessageUser;

export interface ApiStats {
	files: {
		bytes: string;
		size: number;
	};
	links: number;
}

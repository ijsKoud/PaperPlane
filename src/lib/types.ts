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

export type CleanUser = Omit<User, "password">;

export interface ApiFile {
	name: string;
	url: string;

	visible: boolean;
	pwdProtection: boolean;
	size: string;
	isImage: boolean;

	date: Date;
	views: number;
	pinned: boolean;
}

export interface ApiURL {
	name: string;
	url: string;
	redirect: string;

	visible: boolean;
	date: Date;
	visits: number;
	pinned: boolean;
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
	"visits-up": "Visits: High - Small",
	"visits-down": "Visits: Small - High",
	name: "Name: A - Z",
	"name-reverse": "Name: Z - A"
};

export const FILE_SORT_OPTIONS = {
	"date-new": "Date: New - Old",
	"date-old": "Date: Old - New",
	"views-up": "Views: High - Small",
	"views-down": "Views: Small - High",
	"bytes-small": "Size: High - Small",
	"bytes-large": "Size: Small - High",
	name: "Name: A - Z",
	"name-reverse": "Name: Z - A"
};

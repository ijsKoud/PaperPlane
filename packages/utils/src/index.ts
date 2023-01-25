import { Timestamp } from "@sapphire/timestamp";
import packageJSON from "../../../package.json";
import type { TIME_UNITS_ARRAY } from "./Admin";

export const PAPERPLANE_VERSION = packageJSON.version;
export const STORAGE_UNITS = ["B", "kB", "MB", "GB", "TB", "PB"] as const;

export const parseReleaseMarkdown = (release: string): string => {
	const getUrlString = (pr: string): string => {
		const baseUrl = "https://github.com/ijsKoud/PaperPlane/pull/";

		return `[${pr}](${baseUrl}${pr.slice(1, pr.length)})`;
	};

	const pattern = /#\d+/g;
	const matches = release.match(pattern) ?? [];
	matches.forEach((str) => (release = release.replace(str, getUrlString(str))));

	return release;
};

export const getCircleColor = (percentage: number): string => {
	if (percentage < 25) return "#0070F3";
	if (percentage < 50) return "#1A2DD6";
	if (percentage < 75) return "#6C1AD6";

	return "#EA0C1B";
};

export const formatBytes = (bytes: number) => {
	if (bytes === Infinity) return "Infinity";
	let num = 0;

	while (bytes > 1024) {
		bytes /= 1024;
		++num;
	}

	return `${bytes.toFixed(1)} ${STORAGE_UNITS[num]}`;
};

export const formatDate = (date: Date): string => {
	const timestamp = new Timestamp("lll");
	return timestamp.display(date);
};

export const getProtocol = () => {
	return process.env.INSECURE_REQUESTS ? "http://" : "https://";
};

export const parseToDay = (amount: number, unit: (typeof TIME_UNITS_ARRAY)[number]) => {
	switch (unit) {
		case "w":
			unit = "d";
			amount *= 7;
			break;
		case "mth":
			unit = "d";
			amount *= 31;
			break;
		case "y":
			unit = "d";
			amount *= 365;
			break;
		default:
			break;
	}

	return `${amount}${unit}`;
};

export * from "./Dashboard";
export * from "./Admin";

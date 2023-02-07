export interface iBackupV400 {
	version: string;
	encryption: string;
	users: {
		pathId: string;
		domain: string;
		date: string;
		disabled: boolean;
		password: string | null;
		twoFactorSecret: string | null;
		backupCodes: string;
		maxStorage: string;
		maxUploadSize: string;
		extensionsList: string;
		extensionsMode: string;
		auditlogDuration: string;
		nameLength: number;
		nameStrategy: "id" | "zerowidth" | "name";
		embedEnabled: boolean;
		embedDescription: string;
		embedTitle: string;
		embedColor: string;
		apiTokens: {
			name: string;
			token: string;
			date: string;
			domain: string;
		}[];
	}[];
	files: {
		id: string;
		path: string;
		domain: string;
		date: string;
		views: number;
		size: string;
		password: null | string;
		authSecret: string;
		visible: boolean;
	}[];
	urls: {
		id: string;
		domain: string;
		url: string;
		date: string;
		visits: number;
		visible: boolean;
	}[];
	auditlogs: {
		id: string;
		date: string;
		type: string;
		user: string;
		details: string;
	}[];
	invites: { invite: string; date: string }[];
	signupDomains: { domain: string; date: string }[];
}

export interface iBackupV300 {
	version: string;
	user: {
		username: string;
		password: string;
		token: string;
		embedEnabled: boolean;
		embedTitle: string | null;
		embedDescription: string | null;
		embedColour: string;
	};
	files: {
		id: string;
		path: string;
		date: string;
		views: number;
		size: string;
		password: string | null;
		visible: boolean;
	}[];
	urls: {
		id: string;
		url: string;
		date: string;
		visits: number;
		visible: boolean;
	}[];
}

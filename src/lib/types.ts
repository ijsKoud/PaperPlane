/* eslint-disable @typescript-eslint/ban-types */
/* == General == */
export interface ApiError {
	message: string;
	error: string;
}

export type FC<Props extends Record<string, any> = {}> = React.FC<Props & { children?: React.ReactNode }>;

/* == Stats == */
export interface Stats {
	files: {
		size: number;
		bytes: string;
	};
	links: number;
}

/* == File == */
export interface FileStats {
	name: string;
	size: string;
	date: string;
	type: string;
}

export interface File {
	name: string;
	size: string;
	_size: number;
	date: number;
	type: string;
}

/* == Link == */
export interface LinkStats {
	id: string;
	url: string;
	date: string;
}

/* == Login == */
export interface LoginCreds {
	username: string;
	password: string;
}

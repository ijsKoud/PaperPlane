export interface User {
	username: string;
	userId: string;
	password: string;
	token: string;
}

export interface Session {
	token: string;
	userId: string;
	user: User;
}

export interface ApiError {
	message: string;
	error: string;
}

export interface Stats {
	files: {
		bytes: string;
		size: number;
	};
	links: number;
	users: number;
}

export interface FileStats {
	name: string;
	size: string;
	date: string;
	type: string;
}

export interface LinkStats {
	path: string;
	url: string;
	date: string;
}

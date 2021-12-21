/* == General == */
export interface ApiError {
	message: string;
	error: string;
}

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

/* == Link == */
export interface LinkStats {
	path: string;
	url: string;
	date: string;
}

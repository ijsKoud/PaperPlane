export type SearchParams<K extends string> = { [X in K]: string | string[] | undefined };
export interface PageProps<P extends Record<string, string> | undefined = undefined, S extends SearchParams<any> | undefined = undefined> {
	params: P;
	searchParams: S;
}

export interface ApiErrorResponse {
	errors: ApiError[];
}

export interface ApiError {
	/** The path to the value causing the error */
	field: string;

	/** The error code associated with this error */
	code: string;

	/** The error message */
	message: string;
}

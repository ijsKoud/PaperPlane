export type SearchParams<K extends string> = { [X in K]: string | string[] | undefined };
export interface PageProps<P extends Record<string, string> | undefined = undefined, S extends SearchParams<any> | undefined = undefined> {
	params: P;
	searchParams: S;
}

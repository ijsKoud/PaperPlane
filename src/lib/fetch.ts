import axios, { AxiosRequestConfig, AxiosPromise } from "axios";

export const fetch = <v = any>(path: string, options: AxiosRequestConfig) => {
	options.url = `${process.env.NEXT_PUBLIC_DOMAIN}${path}`;
	options.withCredentials ??= true;
	options.headers ??= {};

	if (options.method !== "get" && options.method !== "GET")
		options.headers["Content-Type"] = options.headers["Content-Type"] ?? "application/json";

	return axios(options) as AxiosPromise<v>;
};

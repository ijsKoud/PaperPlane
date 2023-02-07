import type { AxiosPromise, AxiosRequestConfig, CancelToken } from "axios";
import { getCookie } from "cookies-next";
import axios from "axios";

export function getCancelToken() {
	return axios.CancelToken.source();
}

export function fetch<V = unknown>(path: string, cancelToken?: CancelToken, options: AxiosRequestConfig = {}): AxiosPromise<V> {
	options.url = path;
	options.cancelToken ??= cancelToken;

	options.headers ??= {};
	(options.headers as Record<string, any>)["Authorization"] ??= `Bearer ${getCookie("PAPERPLANE_AUTH")}`;

	if (options.method !== "get" && options.method !== "GET") (options.headers as Record<string, any>)["Content-Type"] ??= "application/json";

	return axios(options) as AxiosPromise<V>;
}

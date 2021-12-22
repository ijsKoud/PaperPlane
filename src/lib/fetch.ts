import type { AxiosPromise, AxiosRequestConfig, CancelToken } from "axios";
import axios from "axios";

export function getCancelToken() {
	return axios.CancelToken.source();
}

export function fetch<V = unknown>(path: string, cancelToken?: CancelToken, options: AxiosRequestConfig = {}): AxiosPromise<V> {
	options.url = `${process.env.NEXT_PUBLIC_DOMAIN}${path}`;
	options.cancelToken ??= cancelToken;

	options.headers ??= {};
	options.headers["Authorization"] ??= `Bearer ${localStorage.getItem("PAPERPLANE_AUTH")}`;

	if (options.method !== "get" && options.method !== "GET") options.headers["Content-Type"] ??= "application/json";

	return axios(options) as AxiosPromise<V>;
}

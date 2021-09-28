import axios, { AxiosRequestConfig, AxiosPromise } from "axios";

export const fetch = <v = any>(path: string, options: AxiosRequestConfig) => {
	options.url = `${process.env.NEXT_PUBLIC_API}${path}`;
	options.withCredentials ??= true;
	return axios(options) as AxiosPromise<v>;
};

import axios from "axios";
import UseSwr from "swr";
import type { FetcherResponse, PublicConfiguration } from "swr/_internal";

export const defaultFetcher = (url: string) => axios.get(url, { withCredentials: true }).then((res) => res.data);

export const useSwr = <Response = any, Error = any>(
	url: string,
	options?: Partial<PublicConfiguration<Response, Error, (args: string) => FetcherResponse<Response>>>,
	fetcher = defaultFetcher
) => {
	const swr = UseSwr<Response, Error, string>(url, fetcher, { revalidateOnFocus: false, ...options });
	return swr;
};

export const useSwrWithUpdates = <Response = any, Error = any>(
	url: string,
	options?: Partial<PublicConfiguration<Response, Error, (args: string) => FetcherResponse<Response>>>,
	fetcher = defaultFetcher
) => {
	const swr = UseSwr<Response, Error, string>(url, fetcher, { refreshInterval: 5e3, revalidateOnFocus: false, ...options });
	return swr;
};

import axios from "axios";
import UseSwr from "swr";

export const defaultFetcher = (url: string) => axios.get(url).then((res) => res.data);

export const useSwr = <Response = any, Error = any>(url: string, fetcher = defaultFetcher) => {
	const swr = UseSwr<Response, Error, string>(url, fetcher);
	return swr;
};

export const useSwrWithUpdates = <Response = any, Error = any>(url: string, fetcher = defaultFetcher) => {
	const swr = UseSwr<Response, Error, string>(url, fetcher, { refreshInterval: 5e3 });
	return swr;
};

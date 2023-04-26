import type React from "react";
import { useState } from "react";
import { SWRConfig, type Cache } from "swr";

export const SwrWrapper: React.FC<React.PropsWithChildren> = ({ children }) => {
	const [cache] = useState(new Map<string, any>());

	const localStorageProvider = (): Cache<any> => {
		const parse = (data: string) => (data === "undefined" ? undefined : JSON.parse(data));

		if (typeof localStorage !== "undefined") {
			for (const [key, data] of Object.entries(localStorage)) {
				if (key.startsWith("swr-")) cache.set(key.slice(4), parse(data));
			}

			window.addEventListener("beforeunload", () => {
				cache.forEach((value, key) => localStorage.setItem(`swr-${key}`, JSON.stringify(value)));
			});
		}

		return cache;
	};

	return <SWRConfig value={{ provider: localStorageProvider }}>{children}</SWRConfig>;
};

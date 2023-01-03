import type React from "react";
import { useState } from "react";
import { SWRConfig, Cache } from "swr";

const SwrWrapper: React.FC<React.PropsWithChildren> = ({ children }) => {
	const [cache] = useState(new Map<string, any>());

	const localStorageProvider = (): Cache<any> => {
		const parse = (data: string) => (data === "undefined" ? undefined : JSON.parse(data));

		if (typeof localStorage !== "undefined") {
			for (const [key, data] of Object.entries(localStorage)) {
				if (key.startsWith("swr-")) cache.set(key.slice(4), parse(data));
			}

			window.addEventListener("beforeunload", () => {
				for (const [key, data] of cache.entries()) {
					localStorage.setItem(`swr-${key}`, JSON.stringify(data));
				}
			});
		}

		return cache;
	};

	return <SWRConfig value={{ provider: localStorageProvider }}>{children}</SWRConfig>;
};

export default SwrWrapper;

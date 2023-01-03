import type React from "react";
import { SWRConfig } from "swr";

const Swr: React.FC<React.PropsWithChildren> = ({ children }) => {
	const localStorageProvider = (): Map<string, any> => {
		if (typeof localStorage !== "undefined") {
			const map = new Map<string, any>(JSON.parse(localStorage.getItem("app-cache") || "[]"));

			window.addEventListener("beforeunload", () => {
				const appCache = JSON.stringify(Array.from(map.entries()));
				localStorage.setItem("app-cache", appCache);
			});

			return map;
		}

		return new Map<string, any>();
	};

	return <SWRConfig value={{ provider: localStorageProvider }}>{children}</SWRConfig>;
};

export default Swr;

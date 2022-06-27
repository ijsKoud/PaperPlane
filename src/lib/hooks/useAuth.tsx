import React, { useState, useContext, createContext, useEffect } from "react";
import { fetch, getCancelToken } from "../fetch";
import type { CleanUser, FC } from "../types";

interface UseAuth {
	user: CleanUser | null;
	loading: boolean;
	fetch: (removeOnError?: boolean) => void;
}

const authContext = createContext<UseAuth>({ user: null, loading: true, fetch: () => void 0 });

export const ProvideAuth: FC = ({ children }) => {
	const auth = useProvideAuth();
	return <authContext.Provider value={auth}>{children}</authContext.Provider>;
};

export const useAuth = () => {
	return useContext(authContext);
};

const useProvideAuth = (): UseAuth => {
	const [user, setUser] = useState<CleanUser | null>(null);
	const [loading, setLoading] = useState<true | false>(true);

	useEffect(() => {
		const { cancel, token } = getCancelToken();
		fetch<CleanUser>("/api/user", token)
			.then((res) => {
				setUser(res.data);
				setLoading(false);
			})
			.catch(() => setLoading(false));

		return () => cancel();
	}, []);

	const reFetch = (removeOnError = false) =>
		fetch<CleanUser>("/api/user")
			.then((res) => {
				setUser(res.data);
				setLoading(false);
			})
			.catch(() => {
				if (removeOnError) setUser(null);
				setLoading(false);
			});

	return {
		user,
		loading,
		fetch: reFetch
	};
};

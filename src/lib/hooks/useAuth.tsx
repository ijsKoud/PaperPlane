import React, { useState, useContext, createContext, useEffect } from "react";
import { fetch } from "../fetch";
import { User } from "../types";

interface UseAuth {
	user: User | null;
	loading: boolean;
	// eslint-disable-next-line no-unused-vars
	fetch: (removeOnError?: boolean) => void;
}

const authContext = createContext<UseAuth>({ user: null, loading: true, fetch: () => void 0 });

export const ProvideAuth: React.FC = ({ children }) => {
	const auth = useProvideAuth();
	return <authContext.Provider value={auth}>{children}</authContext.Provider>;
};

export const useAuth = () => {
	return useContext(authContext);
};

const useProvideAuth = (): UseAuth => {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState<true | false>(true);

	useEffect(() => {
		fetch("/user/", { method: "get", withCredentials: true })
			.then((res) => {
				setUser(res.data);
				setLoading(false);
			})
			.catch(() => setLoading(false));
	}, []);

	const reFetch = (removeOnError = false) =>
		fetch("/user/", { method: "get", withCredentials: true })
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
		fetch: reFetch,
	};
};

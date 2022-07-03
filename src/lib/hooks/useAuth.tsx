import React, { useState, useContext, createContext, useEffect } from "react";
import { fetch, getCancelToken } from "../fetch";
import type { CleanUser, FC } from "../types";
import { handlerWs } from "../WebsocketHandler";

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
	const [websocket, setWebsocket] = useState<WebSocket>();
	const [loading, setLoading] = useState<true | false>(true);

	const getProtocol = () => {
		const env = process.env.NEXT_PUBLIC_SECURE;
		if (env && env === "false") return "ws://";

		return "wss://";
	};

	const connectWebsocket = () => {
		const url = `${getProtocol()}${location.host}/websocket`;
		const ws = new WebSocket(url);
		const handler = handlerWs({ websocket: ws });
		setWebsocket(ws);

		ws.onopen = handler.onOpen.bind(handler);
		ws.onmessage = (ev) => handler.onMessage(ev.data);
		ws.onclose = (ev) => {
			handler.onClose();

			console.log("ws connection closed", ev.code);
			setWebsocket(undefined);

			if (ev.code === 3000) return;
			setTimeout(() => connectWebsocket(), 5e3);
		};
	};

	useEffect(() => {
		const { cancel, token } = getCancelToken();
		fetch<CleanUser>("/api/user", token)
			.then((res) => {
				setUser(res.data);
				setLoading(false);
			})
			.catch(() => setLoading(false));

		connectWebsocket();
		return () => {
			websocket?.close();
			cancel();
		};
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

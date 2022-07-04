import React, { useState, useContext, createContext, useEffect } from "react";
import { fetch, getCancelToken } from "../fetch";
import type { ApiFile, ApiURL, CleanUser, FC } from "../types";
import { handlerWs } from "../WebsocketHandler";

interface UseAuth {
	user: CleanUser | null;
	websocket: WebSocket | undefined;

	files: ApiFile[];
	urls: ApiURL[];

	urlPages: number;
	filePages: number;

	loading: boolean;
	fetch: (removeOnError?: boolean) => void;
}

const authContext = createContext<UseAuth>({
	user: null,
	urlPages: 1,
	filePages: 1,
	websocket: undefined,
	urls: [],
	files: [],
	loading: true,
	fetch: () => void 0
});

export const ProvideAuth: FC = ({ children }) => {
	const auth = useProvideAuth();
	return <authContext.Provider value={auth}>{children}</authContext.Provider>;
};

export const useAuth = () => {
	return useContext(authContext);
};

const useProvideAuth = (): UseAuth => {
	const [user, setUser] = useState<CleanUser | null>(null);
	const [files, setFiles] = useState<ApiFile[]>([]);
	const [urls, setUrls] = useState<ApiURL[]>([]);

	const [filePages, setFilePages] = useState(1);
	const [urlPages, setUrlPages] = useState(1);

	const [loading, setLoading] = useState<true | false>(true);
	const [websocket, setWebsocket] = useState<WebSocket>();

	const getProtocol = () => {
		const env = process.env.NEXT_PUBLIC_SECURE;
		if (env && env === "false") return "ws://";

		return "wss://";
	};

	const connectWebsocket = () => {
		const url = `${getProtocol()}${location.host}/websocket`;
		const ws = new WebSocket(url);
		const handler = handlerWs({ websocket: ws, setFiles, setUrls, setUser, setUrlPages, setFilePages });
		setWebsocket(ws);

		ws.onopen = handler.onOpen.bind(handler);
		ws.onmessage = (ev) => handler.onMessage(ev.data);
		ws.onclose = (ev) => {
			setWebsocket(undefined);
			handler.onClose();
			console.log("ws connection closed", ev.code);

			if (ev.code === 3000) return;
			setTimeout(() => connectWebsocket(), 5e3);
		};

		return ws;
	};

	useEffect(() => {
		const { cancel, token } = getCancelToken();
		fetch<CleanUser>("/api/user", token)
			.then((res) => {
				setUser(res.data);
				setLoading(false);
			})
			.catch(() => setLoading(false));

		const ws = connectWebsocket();
		return () => {
			ws.close();
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
		files,
		urls,
		loading,
		websocket,
		urlPages,
		filePages,
		fetch: reFetch
	};
};

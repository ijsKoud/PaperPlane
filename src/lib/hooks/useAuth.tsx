import React, { useState, useContext, createContext, useEffect } from "react";
import type { ApiFile, ApiStats, ApiURL, CleanUser, FC } from "../types";
import { handlerWs } from "../WebsocketHandler";

interface UseAuth {
	user: CleanUser | null;
	websocket: WebSocket | undefined;

	files: ApiFile[];
	urls: ApiURL[];
	stats: ApiStats;

	urlPages: number;
	filePages: number;

	loading: boolean;
	fetch: (removeOnError?: boolean) => void;
}

const mockStats = { files: { bytes: "0 B", size: 0 }, links: 0 };
const authContext = createContext<UseAuth>({
	user: null,
	urlPages: 1,
	filePages: 1,
	websocket: undefined,
	urls: [],
	files: [],
	stats: mockStats,
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
	const [stats, setStats] = useState<ApiStats>(mockStats);

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
		if (websocket) {
			// close an existing websocket
			websocket.close();
			setUser(null);
			setFiles([]);
			setUrls([]);
			setStats(mockStats);
			setFilePages(0);
			setUrlPages(0);
			setWebsocket(undefined);
			setLoading(true);
		}

		const url = `${getProtocol()}${location.host}/websocket`;
		const ws = new WebSocket(url);
		const handler = handlerWs({ websocket: ws, setFiles, setUrls, setUser, setLoading, setUrlPages, setFilePages, setStats });
		setWebsocket(ws);

		ws.onopen = handler.onOpen.bind(handler);
		ws.onmessage = (ev) => handler.onMessage(ev.data);
		ws.onclose = (ev) => {
			setWebsocket(undefined);
			handler.onClose();
			console.log("ws connection closed", ev.code);

			if (ev.code === 3000) {
				setLoading(false);
				return;
			}

			setTimeout(() => connectWebsocket(), 5e3);
		};

		return ws;
	};

	useEffect(() => {
		setLoading(true);
		const ws = connectWebsocket();

		return () => {
			if (websocket) websocket.close();
			ws.close();
		};
	}, []);

	return {
		user,
		files,
		urls,
		stats,
		loading,
		websocket,
		urlPages,
		filePages,
		fetch: () => connectWebsocket()
	};
};

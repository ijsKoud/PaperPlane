import { ApiFile, ApiStats, ApiURL, CleanUser, WebsocketMessage, WebsocketMessageType } from "./types";

/* eslint-disable @typescript-eslint/ban-types */
interface Props {
	websocket: WebSocket;

	setFiles: (files: ApiFile[]) => void;
	setUrls: (urls: ApiURL[]) => void;
	setStats: (stats: ApiStats) => void;

	setUser: (user: CleanUser) => void;
	setLoading: (loading: boolean) => void;

	setFilePages: (pages: number) => void;
	setUrlPages: (pages: number) => void;
}

export const handlerWs = ({ websocket, setFiles, setUrls, setUser, setLoading, setUrlPages, setFilePages, setStats }: Props) => {
	let interval: NodeJS.Timeout | undefined;

	const onOpen = () => {
		const pingMessage = stringify({ t: WebsocketMessageType.PING, d: {} });
		websocket.send(pingMessage);

		console.log("[WS] => Connection established with remote server.");
		interval = setInterval(() => websocket.send(pingMessage), 5e3);
	};

	const onClose = () => {
		if (interval) clearInterval(interval);
	};

	const onMessage = (_data: any) => {
		if (_data instanceof ArrayBuffer) _data = Buffer.from(_data);
		else if (Array.isArray(_data)) _data = Buffer.concat(_data);
		if (!_data) return;

		const data = parse(_data);
		switch (data.t) {
			case WebsocketMessageType.INIT:
				setFiles(data.d.files);
				setUrls(data.d.urls);
				setStats(data.d.stats);

				setUser(data.d.user);
				setLoading(false);

				setUrlPages(data.d.pages.urls);
				setFilePages(data.d.pages.files);
				break;
			case WebsocketMessageType.FILES_UPDATE:
				setFiles(data.d.files);
				setFilePages(data.d.pages);
				setStats(data.d.stats);
				break;
			case WebsocketMessageType.URL_UPDATE:
				setUrls(data.d.urls);
				setUrlPages(data.d.pages);
				setStats(data.d.stats);
				break;
			case WebsocketMessageType.USER_UPDATE:
				setUser(data.d.user);
				break;
			default:
				break;
		}
	};

	return {
		onClose,
		onOpen,
		onMessage
	};
};

export const stringify = (data: WebsocketMessage): string => {
	return JSON.stringify(data);
};

const parse = (data: string): WebsocketMessage => {
	const parsed = JSON.parse(data) as WebsocketMessage;
	if (!parsed.d || !parsed.t) return { d: {}, t: 0 };

	return parsed;
};

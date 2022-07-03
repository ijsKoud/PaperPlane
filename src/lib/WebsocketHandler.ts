import { WebsocketMessage, WebsocketMessageType } from "./types";

/* eslint-disable @typescript-eslint/ban-types */
interface Props {
	websocket: WebSocket;
}

export const handlerWs = ({ websocket }: Props) => {
	let interval: NodeJS.Timeout | undefined;

	const onOpen = () => {
		const pingMessage = send({ t: WebsocketMessageType.PING, d: {} });
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
				console.log(data.d);
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

const send = (data: WebsocketMessage): string => {
	return JSON.stringify(data);
};

const parse = (data: string): WebsocketMessage => {
	const parsed = JSON.parse(data) as WebsocketMessage;
	if (!parsed.d || !parsed.t) return { d: {}, t: 0 };

	return parsed;
};

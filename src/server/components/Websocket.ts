import type { Server } from "../Server";
import { getUserFromAuth, iWebsocket, WebsocketMessage, WebsocketMessageType } from "../utils";
import type { MessageEvent } from "ws";
import type { Request } from "express";
import ShortUniqueId from "short-unique-id";

export class Websocket {
	public timeouts: Record<string, NodeJS.Timeout> = {};

	public constructor(public server: Server) {}

	public init() {
		// @ts-ignore types still correct, only added a custom id prop to it
		this.server.express.ws("/websocket", this.onWebsocket.bind(this));
	}

	private async onWebsocket(ws: iWebsocket, req: Request) {
		const { authorization } = req.headers;
		const user = await getUserFromAuth(authorization, this.server.prisma);
		if (!user) return ws.close(3000); // Close connection when no user is found

		this.server.prisma.$on("query", (ev) => void 0); // TODO: send user update pkg when user is update
		this.setData(ws);

		ws.onmessage = (ev) => this.onMessage(ev, ws);
	}

	private setData(ws: iWebsocket) {
		const timeout = setTimeout(() => ws.close(), 5e3 + 1e3);
		const genId = new ShortUniqueId({ length: 10 });

		ws.id = genId();
		this.timeouts[ws.id] = timeout;
	}

	private onMessage({ data }: MessageEvent, ws: iWebsocket) {
		if (data instanceof ArrayBuffer) data = Buffer.from(data);
		else if (Array.isArray(data)) data = Buffer.concat(data);
		if (!data) return;

		// eslint-disable-next-line @typescript-eslint/no-base-to-string
		const payload = JSON.parse(data.toString()) as WebsocketMessage;
		switch (payload.t) {
			case WebsocketMessageType.PING:
				{
					const timeout = this.timeouts[ws.id];
					if (timeout) clearTimeout(timeout);

					const newTimeout = setTimeout(() => ws.close(), 5e3 + 1e3);
					this.timeouts[ws.id] = newTimeout;
				}
				break;
			default:
				break;
		}
	}
}

import type { Server } from "../Server";
import { getUser, iWebsocket, WebsocketMessage, WebsocketMessageType } from "../utils";
import { MessageEvent, Server as WebSocketServer } from "ws";
import ShortUniqueId from "short-unique-id";
import { URL } from "node:url";
import type { IncomingMessage } from "node:http";
import { parse } from "cookie";

export class Websocket {
	public timeouts: Record<string, NodeJS.Timeout> = {};
	public socketServer: WebSocketServer;

	public constructor(public server: Server) {
		this.socketServer = new WebSocketServer({ noServer: true, path: "/websocket" });
	}

	public init() {
		this.server._server.on("upgrade", (request, socket, head) => {
			if (new URL(request.url ?? "", "http://localhost:3000").pathname !== "/websocket") return;
			this.socketServer.handleUpgrade(request, socket, head, (socket) => this.socketServer.emit("connection", socket, request));
		});

		this.socketServer.on("connection", (ws, req) => this.onWebsocket(ws as iWebsocket, req));
	}

	private async onWebsocket(ws: iWebsocket, req: IncomingMessage) {
		const cookies = parse(req.headers.cookie ?? "");
		const cookie = cookies["PAPERPLANE_AUTH"];

		const user = await getUser(cookie, this.server.prisma);
		if (!user) return ws.close(3000); // Close connection when no user is found
		this.setData(ws);

		ws.onmessage = (ev) => this.onMessage(ev, ws);
		ws.onclose = () => {
			const timeout = this.timeouts[ws.id];
			if (timeout) {
				clearTimeout(timeout);
				delete this.timeouts[ws.id];
			}
		};

		ws.send(this.send({ t: WebsocketMessageType.INIT, d: { user } }));
	}

	private setData(ws: iWebsocket) {
		const timeout = setTimeout(() => ws.close(), 5e3 + 1e3);
		const genId = new ShortUniqueId({ length: 10 });

		ws.id = genId();
		this.timeouts[ws.id] = timeout;
	}

	private send(data: WebsocketMessage): string {
		return JSON.stringify(data);
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

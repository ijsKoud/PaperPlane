import type { Server } from "../Server";
import {
	ApiFile,
	ApiURL,
	chunk,
	decryptToken,
	formatBytes,
	getFileExt,
	getProtocol,
	getUser,
	iWebsocket,
	sortFilesArray,
	sortLinksArray,
	WebsocketMessage,
	WebsocketMessageType
} from "../utils";
import { MessageEvent, Server as WebSocketServer } from "ws";
import ShortUniqueId from "short-unique-id";
import { URL } from "node:url";
import type { IncomingMessage } from "node:http";
import { parse } from "cookie";
import { lookup } from "mime-types";
import Fuse from "fuse.js";
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
		const baseURL = `${getProtocol}${req.headers.host}`;

		const user = await getUser(cookie, this.server.prisma);
		if (!user) return ws.close(3000); // Close connection when no user is found
		this.setData(ws);

		ws.search = {
			page: 1,
			query: "",
			sortType: "default"
		};

		ws.data = {
			user,
			files: await this.getFiles(baseURL, ws.search.query, ws.search.sortType),
			urls: await this.getUrls(baseURL, ws.search.query, ws.search.sortType)
		};

		ws.onmessage = (ev) => this.onMessage(ev, ws);
		ws.onclose = () => {
			const timeout = this.timeouts[ws.id];
			if (timeout) {
				clearTimeout(timeout);
				delete this.timeouts[ws.id];
			}
		};

		ws.send(this.stringify({ t: WebsocketMessageType.INIT, d: { user, files: ws.data.files[0], urls: ws.data.urls[0] } }));
	}

	private setData(ws: iWebsocket) {
		const timeout = setTimeout(() => ws.close(), 5e3 + 1e3);
		const genId = new ShortUniqueId({ length: 10 });

		ws.id = genId();
		this.timeouts[ws.id] = timeout;
	}

	private stringify(data: WebsocketMessage): string {
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

	private async getFiles(baseURL: string, searchQ: string, sortType: string) {
		const dbFiles = await this.server.prisma.file.findMany();
		const files = dbFiles.map<ApiFile>((f) => {
			const fileName = f.path.split("/").reverse()[0];
			const fileExt = getFileExt(fileName);
			const fileId = f.id;

			const hiddenChar = ["\u200B", "\u2060", "\u200C", "\u200D"];
			const invisId = hiddenChar.some((char) => fileId.includes(char));

			const apiFileName = `${fileId}${invisId ? "" : fileExt}`;

			return {
				name: apiFileName,
				size: formatBytes(Number(f.size)),
				_size: f.size,
				date: f.date,
				views: f.views,
				isImage: (lookup(`name${fileExt}`) || "").includes("image"),
				pwdProtection: Boolean(f.password),
				password: f.password ? decryptToken(f.password) : null,
				visible: f.visible,
				url: `${baseURL}/files/${apiFileName}`
			};
		});

		let apiRes: ApiFile[] = files;
		if (searchQ) {
			const search = new Fuse(files, { keys: ["name"], isCaseSensitive: false });
			apiRes = search.search(searchQ).map((sr) => sr.item);
		}

		const sortedArr = sortFilesArray(apiRes as any, sortType);
		const chunks = chunk(sortedArr, 25);

		return chunks;
	}

	private async getUrls(baseURL: string, searchQ: string, sortType: string) {
		const dbUrls = await this.server.prisma.url.findMany();
		const urls = dbUrls.map<ApiURL>((url) => {
			return {
				date: url.date,
				name: url.id,
				redirect: url.url,
				url: `${baseURL}/r/${url.id}`,
				visible: url.visible,
				visits: url.visits
			};
		});

		let apiRes: ApiURL[] = urls;
		if (searchQ) {
			const search = new Fuse(urls, { keys: ["name", "url"], isCaseSensitive: false });
			apiRes = search.search(searchQ).map((sr) => sr.item);
		}

		const sortedArr = sortLinksArray(apiRes, sortType);
		const chunks = chunk(sortedArr, 25);

		return chunks;
	}
}

import type { Server } from "../Server";
import {
	ApiFile,
	ApiURL,
	chunk,
	CleanUser,
	decryptToken,
	formatBytes,
	getFileExt,
	getProtocol,
	getUser,
	iWebsocket,
	sortFilesArray,
	sortLinksArray,
	WebsocketData,
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
import EventEmitter from "node:events";

export class Websocket {
	public timeouts: Record<string, NodeJS.Timeout> = {};
	public socketServer: WebSocketServer;
	public events: EventEmitter;

	public data!: WebsocketData;

	public constructor(public server: Server) {
		this.socketServer = new WebSocketServer({ noServer: true });
		this.events = new EventEmitter();
	}

	public async init() {
		this.socketServer.on("connection", (ws, req) => this.onWebsocket(ws as iWebsocket, req));
		this.server._server.on("upgrade", (request, socket, head) => {
			if (new URL(request.url ?? "", "http://localhost:3000").pathname !== "/websocket") return;
			this.socketServer.handleUpgrade(request, socket, head, (socket) => this.socketServer.emit("connection", socket, request));
		});

		const user = await this.getUser();
		const files = await this._getFiles();
		const urls = await this._getUrls();
		const stats = await this.getStats();
		this.data = {
			user,
			files,
			urls,
			stats
		};

		this.events
			.on("file_update", async () => {
				const files = await this._getFiles();
				this.data.files = files;

				this.events.emit("file_update_child");
			})
			.on("url_update", async () => {
				const urls = await this._getUrls();
				this.data.urls = urls;

				this.events.emit("url_update_child");
			})
			.on("user_update", async () => {
				const user = await this.getUser();
				this.data.user = user;

				this.events.emit("user_update_child");
			});
	}

	private async onWebsocket(ws: iWebsocket, req: IncomingMessage) {
		const cookies = parse(req.headers.cookie ?? "");
		const cookie = cookies["PAPERPLANE_AUTH"];

		const user = await getUser(cookie, this.server.prisma);
		if (!user) return ws.close(3000); // Close connection when no user is found

		this.setData(ws);
		ws.baseURL = `${getProtocol()}${req.headers.host}`;
		ws.search = {
			files: {
				page: 1,
				query: "",
				sortType: "default"
			},
			urls: {
				page: 1,
				query: "",
				sortType: "default"
			}
		};

		const fileUpdateListener = () => {
			this.send(WebsocketMessageType.FILES_UPDATE, ws);
		};

		const urlUpdateListener = () => {
			this.send(WebsocketMessageType.URL_UPDATE, ws);
		};

		const userUpdateListener = () => {
			this.send(WebsocketMessageType.USER_UPDATE, ws);
		};

		ws.onmessage = (ev) => this.onMessage(ev, ws);
		ws.onclose = () => {
			const timeout = this.timeouts[ws.id];
			if (timeout) {
				clearTimeout(timeout);
				delete this.timeouts[ws.id];
			}

			this.events.removeListener("file_update_child", fileUpdateListener);
			this.events.removeListener("url_update_child", urlUpdateListener);
			this.events.removeListener("user_update_child", userUpdateListener);
		};

		const files = this.getFiles(ws.baseURL, ws.search.files.query, ws.search.files.sortType);
		const urls = this.getUrls(ws.baseURL, ws.search.urls.query, ws.search.urls.sortType);
		ws.send(
			this.stringify({
				t: WebsocketMessageType.INIT,
				d: {
					user,
					files: files[0] ?? [],
					urls: urls[0] ?? [],
					stats: this.data.stats,
					pages: { files: files.length, urls: urls.length }
				}
			})
		);

		this.events.on("file_update_child", fileUpdateListener);
		this.events.on("url_update_child", urlUpdateListener);
		this.events.on("user_update_child", userUpdateListener);
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

	private send(t: WebsocketMessageType, ws: iWebsocket) {
		switch (t) {
			default:
				break;
			case WebsocketMessageType.FILES_UPDATE:
				{
					const files = this.getFiles(ws.baseURL, ws.search.files.query, ws.search.files.sortType);
					const data = this.stringify({
						t,
						d: { files: files[ws.search.files.page - 1] ?? [], pages: files.length, stats: this.data.stats }
					});

					ws.send(data);
				}
				break;
			case WebsocketMessageType.URL_UPDATE:
				{
					const urls = this.getUrls(ws.baseURL, ws.search.urls.query, ws.search.urls.sortType);
					const data = this.stringify({
						t,
						d: { urls: urls[ws.search.urls.page - 1] ?? [], pages: urls.length, stats: this.data.stats }
					});

					ws.send(data);
				}
				break;
			case WebsocketMessageType.USER_UPDATE:
				{
					const data = this.stringify({
						t,
						d: { user: this.data.user }
					});

					ws.send(data);
				}
				break;
		}
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
			case WebsocketMessageType.SEARCH_FILE_UPDATE:
				{
					ws.search.files = { ...ws.search.files, ...payload.d };
					this.send(WebsocketMessageType.FILES_UPDATE, ws);
				}
				break;
			case WebsocketMessageType.SEARCH_URL_UPDATE:
				{
					ws.search.urls = { ...ws.search.urls, ...payload.d };
					this.send(WebsocketMessageType.URL_UPDATE, ws);
				}
				break;
			default:
				break;
		}
	}

	private async getStats() {
		const files = await this.server.prisma.file.findMany();
		const links = await this.server.prisma.url.count();
		const size = files
			.map((f) => f.size)
			.map((size) => Number(size))
			.reduce((a, b) => a + b, 0);

		return {
			links,
			files: {
				size: files.length,
				bytes: formatBytes(size)
			}
		};
	}

	private getFiles(baseURL: string, searchQ: string, sortType: string) {
		const files = this.data.files.map<ApiFile>((f) => ({
			...f,
			url: f.url.replace("{BASE_URL}", baseURL)
		}));

		let apiRes: ApiFile[] = files;
		if (searchQ.length) {
			const search = new Fuse(files, { keys: ["name"], isCaseSensitive: false });
			apiRes = search.search(searchQ).map((sr) => sr.item);
		}

		const sortedArr = sortFilesArray(apiRes as any, sortType);
		const chunks = chunk(sortedArr, 25);

		return chunks;
	}

	private getUrls(baseURL: string, searchQ: string, sortType: string) {
		const urls = this.data.urls.map<ApiURL>((url) => ({
			...url,
			url: url.url.replace("{BASE_URL}", baseURL)
		}));

		let apiRes: ApiURL[] = urls;
		if (searchQ.length) {
			const search = new Fuse(urls, { keys: ["name", "url"], isCaseSensitive: false });
			apiRes = search.search(searchQ).map((sr) => sr.item);
		}

		const sortedArr = sortLinksArray(apiRes, sortType);
		const chunks = chunk(sortedArr, 25);

		return chunks;
	}

	private async _getFiles() {
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
				url: `{BASE_URL}/files/${apiFileName}`
			};
		});

		return files;
	}

	private async _getUrls() {
		const dbUrls = await this.server.prisma.url.findMany();
		const urls = dbUrls.map<ApiURL>((url) => {
			return {
				date: url.date,
				name: url.id,
				redirect: url.url,
				url: `{BASE_URL}/r/${url.id}`,
				visible: url.visible,
				visits: url.visits
			};
		});

		return urls;
	}

	private async getUser() {
		const user = (await this.server.prisma.user.findFirst()) as CleanUser;
		// @ts-ignore yes does exist
		delete user.password;

		return user;
	}
}

import type { WebSocket } from "ws";

/* eslint-disable @typescript-eslint/ban-types */
export interface Config {
	/** Encryption key which is used to encrypt all cookies with */
	encryptionKey: string;
	/** The id generator type
	 * @default id
	 */
	nameType: NameType;
	/** The amount of characters in a file/url id
	 * @default 10
	 */
	nameLength: number;
	/** The port used to listen to requests
	 * @default 3000
	 */
	port: number;
	/** The extensions which are not allowed to be uploaded
	 * @default all extensions
	 */
	extensions: string[];
	/** The amount of files that can be uploaded per request
	 * @default infinity
	 */
	maxFilesPerRequest: number;
	/** The max size a file can be in bytes
	 * @default infinity
	 */
	maxFileSize: number;
}

export type NameType = "id" | "zerowidth" | "name";

export enum WebsocketMessageType {
	PING,
	INIT,
	USER_UPDATE,
	FILES_UPDATE,
	URL_UPDATE,
	STATS_UPDATE,
	SEARCH_FILE_UPDATE,
	SEARCH_URL_UPDATE
}

export interface WebsocketMessagePing {
	t: WebsocketMessageType.PING;
	d: {};
}

export interface WebsocketMessageInit {
	t: WebsocketMessageType.INIT;
	d: {
		hello: string;
	};
}

export type WebsocketMessage = WebsocketMessagePing | WebsocketMessageInit;

export type iWebsocket = WebSocket & { id: string };

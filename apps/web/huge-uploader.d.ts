declare module "huge-uploader" {
	import type EventEmitter from "events";

	export default class Uploader extends EventEmitter {
		public start: number;
		public retriesCount: number;
		public delayBeforeRetry: number;
		public retries: number;
		public file: File;
		public endpoint: string;
		public postParams?: Record<string, any>;
		public headers: Record<string, any>;

		public chunk: Blob | null;
		public chunkCount: number;
		public totalChunks: number;

		public offline: boolean;
		public paused: boolean;

		public constructor(options: UploaderOptions);

		public togglePause(): void;
		public on(event: "error", lisenter: (err: CustomEvent) => void | Promise<void>): this;
		public on(event: "progress", lisenter: (progress: CustomEvent) => void | Promise<void>): this;
		public on(event: "finish" | "offline" | "online", lisenter: () => void | Promise<void>): this;
		public on(
			event: "fileRetry",
			lisenter: (err: CustomEvent<{ chunk: number; message: string; retriesLeft: number }>) => void | Promise<void>
		): this;
	}

	export interface UploaderOptions {
		endpoint: string;
		file: File;
		headers?: Record<string, any>;
		postParams?: Record<string, any>;
		chunkSize?: number;
		retries?: number;
		delayBeforeRetry?: number;
	}
}

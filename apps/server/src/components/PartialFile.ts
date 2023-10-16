import { Auth } from "#lib/Auth.js";
import { join } from "node:path";
import { PrismaClient, type PartialFile as iPartialFile } from "@prisma/client";
import Config from "#lib/Config.js";
import { extension } from "mime-types";
import { Utils } from "#lib/utils.js";
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import type PartialFileManager from "#controllers/PartialFileManager.js";
import type formidable from "formidable";
import { rename } from "node:fs/promises";
import { Worker } from "node:worker_threads";

export default class PartialFile {
	public readonly manager: PartialFileManager;

	/** The unique identifier for this partial file */
	public readonly id: string;
	/** The path to the file chunks */
	public readonly path: string;

	/** The date this partial file was created at */
	public readonly createdAt: Date;

	/** The id of the last chunk */
	public lastChunkId?: string;
	/** The list of chunks */
	public chunks: string[] = [];

	public status: "OPEN" | "PROCESSING" | "FINISHED" = "OPEN";
	public documentId: string | undefined;

	/** Self destruction timeout (1 day from creation date) */
	public timeout!: NodeJS.Timeout;
	private readonly filename: string;
	private readonly mimeType: string;
	private readonly password: string | undefined;
	private readonly visible: boolean;

	public constructor(manager: PartialFileManager, file: iPartialFile) {
		this.manager = manager;
		this.id = file.id;
		this.path = file.path;

		this.createdAt = file.date;

		this.filename = file.filename;
		this.mimeType = file.mimeType;
		this.password = file.password ?? undefined;
		this.visible = file.visible;

		this.populate();
		this.setTimeout();
	}

	/**
	 * Register a file chunk
	 * @param file The file chunk to register
	 */
	public async registerUpload(file: formidable.File) {
		const chunkId = (this.lastChunkId ? this.lastChunkId + 1 : 0).toString();
		this.lastChunkId = chunkId;
		this.chunks.push(chunkId);

		await rename(file.filepath, join(this.path, chunkId));
	}

	public complete() {
		if (["PROCESSING", "FINISHED"].includes(this.status)) return;
		this.status = "PROCESSING";

		if (!this.lastChunkId) throw new Error("Missing lastChunkId");
		if (!this.chunks.length) throw new Error("Missing array of chunk ids");

		const worker = new Worker("./dist/workers/partialFile.js", {
			workerData: {
				path: this.path,
				destination: join(this.manager.domain.filesPath),
				id: this.id,
				createdAt: this.createdAt,
				domain: this.manager.domain.domain,
				password: this.password,
				filename: this.filename,
				mimeType: this.mimeType,
				visible: this.visible,
				chunks: this.chunks,
				lastChunkId: this.lastChunkId
			}
		});

		worker.on("message", (documentId) => {
			this.documentId = documentId;
			this.status = "FINISHED";
		});
	}

	private populate() {
		if (!existsSync(this.path)) mkdirSync(this.path, { recursive: true });
		const chunks = readdirSync(this.path).filter((str) => !isNaN(Number(str)));

		// eslint-disable-next-line prefer-destructuring
		this.lastChunkId = chunks.sort().reverse()[0];
		this.chunks = chunks;
	}

	private setTimeout() {
		const timeLeft = this.createdAt.getTime() + 8.64e7 - Date.now();
		const timeout = setTimeout(() => this.manager.delete(this.id), timeLeft);
		this.timeout = timeout;
	}

	/**
	 * Creates a new partial file instance
	 * @param data The partial file configuration
	 * @param domain The domain associated with this partial file
	 * @returns
	 */
	public static async create(data: PartialFileCreateOptions, manager: PartialFileManager) {
		const id = Auth.generateToken(32);
		const path = join(Config.dataDirectory, "files", "tmp", `chunks_${id}`);

		const fileExt = extension(data.mimeType);
		if (!fileExt) throw new Error("Invalid mimetype provided");

		const name = data.filename
			? data.filename
			: Utils.generateId(manager.domain.nameStrategy, manager.domain.nameLength) || Utils.generateId("id", 32)!;
		const filename = manager.domain.nameStrategy === "zerowidth" || name.includes(".") ? name : `${name}.${fileExt}`;

		const config = Config.getEnv();
		const password = data.password ? Auth.encryptPassword(data.password, config.encryptionKey) : undefined;

		const client = new PrismaClient();
		const file = await client.partialFile.create({ data: { ...data, id, path, filename, password } });

		return new PartialFile(manager, file);
	}
}

export interface PartialFileCreateOptions {
	filename?: string | undefined;
	password?: string | undefined;
	mimeType: string;
	visible: boolean;
}

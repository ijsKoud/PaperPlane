import { Auth } from "#lib/Auth.js";
import Config from "#lib/Config.js";
import { Utils } from "#lib/utils.js";
import { PrismaClient } from "@prisma/client";
import { Logger } from "@snowcrystals/icicle";
import { open, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { isMainThread, workerData, parentPort } from "node:worker_threads";

interface WorkerData {
	path: string;
	destination: string;
	id: string;

	createdAt: Date;
	domain: string;

	password: string | undefined;
	filename: string;
	mimeType: string;
	visible: boolean;

	chunks: string[];
	lastChunkId: string;
}

const logger = new Logger({ name: "worker::partialFile" });
const prisma = new PrismaClient();
const data = workerData as WorkerData;

if (isMainThread) {
	logger.fatal("Instance is run on 'main thread'.");
	process.exit(1);
}

const [lastChunkId] = data.chunks.sort().reverse();
if (data.lastChunkId !== lastChunkId) {
	data.lastChunkId = lastChunkId;
}

async function run() {
	logger.debug("Starting the worker");

	const existingFile = await prisma.file.findFirst({ where: { domain: data.domain, id: data.filename } });
	const fileId = existingFile ? Utils.generateId("id", 12)! : data.filename;

	const filePath = join(data.destination, fileId);
	const stream = await open(filePath, "w");

	for await (const chunk of data.chunks) {
		const buffer = await readFile(join(data.path, chunk));
		await stream.write(buffer);
	}

	const stats = await stream.stat();
	await stream.close();
	await rm(data.path, { recursive: true, force: true });

	const config = Config.getEnv();
	const authBuffer = Buffer.from(`${Auth.generateToken(32)}.${Date.now()}.${data.domain}.${fileId}`).toString("base64");
	const authSecret = Auth.encryptToken(authBuffer, config.encryptionKey);

	await prisma.file.create({
		data: {
			id: fileId,
			date: data.createdAt,
			path: filePath,
			domain: data.domain,
			mimeType: data.mimeType,
			password: data.password,
			visible: data.visible,
			size: Utils.parseStorage(stats.size),
			authSecret
		}
	});

	parentPort?.postMessage(fileId);
	logger.debug("Worker finished");
}

void run();

import Busboy from "busboy";
import type { Request } from "express";
import { createWriteStream, mkdir, readdir, rmdir, stat, unlink, type WriteStream } from "node:fs";
import { appendFile, readFile } from "node:fs/promises";
import { join } from "node:path";
import type internal from "node:stream";

/**
 * Make sure required headers are present & are numbers
 * @param headers req.headers object
 */
function checkHeaders(headers: Request["headers"]) {
	const getCleanHeaders = (header: string | string[] | undefined): string => (Array.isArray(header) ? header[0] : header ?? "");

	if (
		!getCleanHeaders(headers["uploader-chunk-number"]) ||
		!getCleanHeaders(headers["uploader-chunks-total"]) ||
		!getCleanHeaders(headers["uploader-file-id"]) ||
		!getCleanHeaders(headers["uploader-chunks-total"]).match(/^[0-9]+$/) ||
		!getCleanHeaders(headers["uploader-chunk-number"]).match(/^[0-9]+$/) ||
		!getCleanHeaders(headers["uploader-file-id"]).match(/^[0-9]+$/)
	)
		return false;

	return true;
}

/**
 * Make sure total file size isn't bigger than limit
 * @param maxFileSize
 * @param maxChunkSize
 * @param totalChunks
 */
function checkTotalSize(maxFileSize: number, maxChunkSize: number, totalChunks: number) {
	if (maxChunkSize * totalChunks > maxFileSize) return false;
	return true;
}

/**
 * Take all chunks of a file and reassemble them in a unique file
 * @param tmpDir
 * @param dirPath
 * @param fileId
 * @param totalChunks
 * @param postParams – form post fields
 */
function assembleChunk(tmpDir: string, dirPath: string, chunk: number, fileId: string): Promise<any> {
	const assembledFile = join(tmpDir, fileId);
	return new Promise((resolve, reject) => {
		const pipeChunk = () => {
			readFile(join(dirPath, chunk.toString()))
				.then((chunkData) => appendFile(assembledFile, chunkData))
				.then(resolve)
				.catch(reject);
		};

		pipeChunk();
	});
}

/**
 * Delete tmp directory containing chunks
 * @param dirPath
 */
function cleanChunks(dirPath: string) {
	readdir(dirPath, (err, files) => {
		let filesLength = files.length;

		files.forEach((file) => {
			unlink(join(dirPath, file), () => {
				if (--filesLength === 0) rmdir(dirPath, () => void 0); // cb does nothing but required
			});
		});
	});
}

function finishUpload(tmpDir: string, dirPath: string, fileId: string, postParams: Record<string, string>, chunk: number) {
	const assembledFile = join(tmpDir, fileId);
	return () => {
		return new Promise(async (resolve, reject) => {
			console.log("hello1");
			await assembleChunk(tmpDir, dirPath, chunk, fileId).catch(reject);
			console.log("hello2");
			cleanChunks(dirPath);
			console.log("hello3");
			resolve({ filePath: assembledFile, postParams });
		});
	};
}

/**
 * Create directory if it doesn't exist
 * @param dirPath
 * @param callback
 */
function mkdirIfDoesntExist(dirPath: string, callback: (err: any) => void) {
	stat(dirPath, (err) => {
		if (err) mkdir(dirPath, { recursive: true }, callback);
		else callback(null);
	});
}

/**
 * write chunk to upload dir, create tmp dir if first chunk
 * return getFileStatus ƒ to query completion status cb(err, [null | assembleChunks ƒ])
 * assembleChunks ƒ is returned only for last chunk
 * @param tmpDir
 * @param headers
 * @param fileStream
 * @param postParams
 */
function handleFile(tmpDir: string, headers: Request["headers"], fileStream: internal.Readable, postParams: Record<string, any>) {
	const dirPath = join(tmpDir, `${headers["uploader-file-id"]}_tmp`);
	const chunkPath = join(dirPath, `${headers["uploader-chunk-number"]}`);
	const chunkCount = +Number(headers["uploader-chunk-number"]);
	const totalChunks = +Number(headers["uploader-chunks-total"]);

	let error: any;
	let finishUploadFn: () => Promise<any>;
	let finished = false;
	let writeStream: WriteStream;

	const writeFile = () => {
		writeStream = createWriteStream(chunkPath);

		writeStream
			.on("error", (err) => {
				error = err;
				fileStream.resume();
			})
			.on("close", () => {
				finished = true;

				// if all is uploaded
				if (chunkCount === totalChunks - 1) {
					finishUploadFn = finishUpload(tmpDir, dirPath, `${headers["uploader-file-id"]}`, postParams, chunkCount) as () => Promise<any>;
				} else assembleChunk(tmpDir, dirPath, chunkCount, `${headers["uploader-file-id"]}`).catch((err) => (error = err));
			});

		fileStream.pipe(writeStream);
	};

	// make sure chunk is in range
	if (chunkCount < 0 || chunkCount >= totalChunks) {
		error = new Error("Chunk is out of range");
		fileStream.resume();
	}

	// create file upload dir if it's first chunk
	else if (chunkCount === 0) {
		mkdirIfDoesntExist(dirPath, (err) => {
			if (err) {
				error = err;
				fileStream.resume();
			} else writeFile();
		});
	}

	// make sure dir exists if it's not first chunk
	else {
		stat(dirPath, (err) => {
			if (err) {
				error = new Error("Upload has expired");
				fileStream.resume();
			} else writeFile();
		});
	}

	return (callback: (...props: any) => void) => {
		if (finished && !error) callback(null, finishUploadFn);
		else if (error) callback(error);
		else {
			writeStream.on("error", callback);
			writeStream.on("close", () => callback(null, finishUploadFn));
		}
	};
}

/**
 * Master function. Parse form and call child ƒs for writing and assembling
 * @param req – nodejs req object
 * @param options The chunk upload options
 */
export function ChunkUpload(
	req: Request,
	options: ChunkUploadOptions
): Promise<() => Promise<{ filePath: string; postParams: Record<string, any> }>> {
	return new Promise((resolve, reject) => {
		if (!checkHeaders(req.headers)) {
			reject(new Error("Missing header(s)"));
			return;
		}

		if (!checkTotalSize(options.maxFileSize, options.maxChunkSize, Number(req.headers["uploader-chunks-total"]))) {
			reject(new Error("File is above size limit"));
			return;
		}

		try {
			const postParams: Record<string, any> = {};
			let limitReached = false;
			let getFileStatus: (...props: any) => void;

			const busboy = Busboy({ headers: req.headers, limits: { files: 1, fileSize: options.maxChunkSize * 1e3 * 1e3 } });

			busboy.on("file", (_, fileStream) => {
				fileStream.on("limit", () => {
					limitReached = true;
					fileStream.resume();
				});

				getFileStatus = handleFile(options.tmpDir, req.headers, fileStream, postParams);
			});

			busboy.on("field", (key, val) => {
				postParams[key] = val;
			});

			busboy.on("finish", () => {
				if (limitReached) {
					reject(new Error("Chunk is above size limit"));
					return;
				}

				getFileStatus((fileErr: any, finishUpload: () => Promise<{ filePath: string; postParams: Record<string, any> }>) => {
					if (fileErr) reject(fileErr);
					else resolve(finishUpload);
				});
			});

			req.pipe(busboy);
		} catch (err) {
			reject(err);
		}
	});
}

export interface ChunkUploadOptions {
	/** The temporary data directory */
	tmpDir: string;

	/** The max file size per upload */
	maxFileSize: number;

	/** The max size per chunk */
	maxChunkSize: number;
}

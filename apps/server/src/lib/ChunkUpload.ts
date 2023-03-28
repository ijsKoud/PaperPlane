/**
BSD 3-Clause License

Copyright (c) 2018, Quentin Busuttil
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of the copyright holder nor the names of its
  contributors may be used to endorse or promote products derived from
  this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

import type { Request } from "express";
import Busboy from "busboy";
import { createWriteStream, mkdir, readdir, rmdir, stat, unlink, WriteStream } from "node:fs";
import { join } from "node:path";
import { appendFile, readFile } from "node:fs/promises";
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

/**
 * Take all chunks of a file and reassemble them in a unique file
 * @param tmpDir
 * @param dirPath
 * @param fileId
 * @param totalChunks
 * @param postParams – form post fields
 */
function assembleChunks(
	tmpDir: string,
	dirPath: string,
	fileId: string,
	totalChunks: number,
	postParams: Record<string, string>
): () => Promise<any> {
	const assembledFile = join(tmpDir, fileId);
	let chunkCount = 0;

	return () => {
		return new Promise((resolve, reject) => {
			const pipeChunk = () => {
				readFile(join(dirPath, chunkCount.toString()))
					.then((chunk) => appendFile(assembledFile, chunk))
					.then(() => {
						// 0 indexed files = length - 1, so increment before comparison
						if (totalChunks > ++chunkCount) pipeChunk();
						else {
							cleanChunks(dirPath);
							resolve({ filePath: assembledFile, postParams });
						}
					})
					.catch(reject);
			};

			pipeChunk();
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
	let assembleChunksPromise: () => Promise<any>;
	let finished = false;
	let writeStream: WriteStream;

	const writeFile = () => {
		writeStream = createWriteStream(chunkPath);

		writeStream.on("error", (err) => {
			error = err;
			fileStream.resume();
		});

		writeStream.on("close", () => {
			finished = true;

			// if all is uploaded
			if (chunkCount === totalChunks - 1) {
				assembleChunksPromise = assembleChunks(tmpDir, dirPath, `${headers["uploader-file-id"]}`, totalChunks, postParams);
			}
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
		if (finished && !error) callback(null, assembleChunksPromise);
		else if (error) callback(error);
		else {
			writeStream.on("error", callback);
			writeStream.on("close", () => callback(null, assembleChunksPromise));
		}
	};
}

/**
 * Master function. Parse form and call child ƒs for writing and assembling
 * @param req – nodejs req object
 * @param tmpDir – upload temp dir
 * @param maxChunkSize
 */
export function chunkUpload(
	req: Request,
	tmpDir: string,
	maxFileSize: number,
	maxChunkSize: number
): Promise<() => Promise<{ filePath: string; postParams: Record<string, any> }>> {
	return new Promise((resolve, reject) => {
		if (!checkHeaders(req.headers)) {
			reject(new Error("Missing header(s)"));
			return;
		}

		if (!checkTotalSize(maxFileSize, maxChunkSize, Number(req.headers["uploader-chunks-total"]))) {
			reject(new Error("File is above size limit"));
			return;
		}

		try {
			const postParams: Record<string, any> = {};
			let limitReached = false;
			let getFileStatus: (...props: any) => void;

			const busboy = Busboy({ headers: req.headers, limits: { files: 1, fileSize: maxChunkSize * 1000 * 1000 } });

			busboy.on("file", (_, fileStream) => {
				fileStream.on("limit", () => {
					limitReached = true;
					fileStream.resume();
				});

				getFileStatus = handleFile(tmpDir, req.headers, fileStream, postParams);
			});

			busboy.on("field", (key, val) => {
				postParams[key] = val;
			});

			busboy.on("finish", () => {
				if (limitReached) {
					reject(new Error("Chunk is above size limit"));
					return;
				}

				getFileStatus((fileErr: any, assembleChunksF: () => Promise<{ filePath: string; postParams: Record<string, any> }>) => {
					if (fileErr) reject(fileErr);
					else resolve(assembleChunksF);
				});
			});

			req.pipe(busboy);
		} catch (err) {
			reject(err);
		}
	});
}

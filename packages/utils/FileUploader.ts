import axios from "axios";

export default class FileUploader {
	public readonly uploadRoute = "/api/v1/upload/chunk/upload";
	public readonly createRoute = "/api/v1/upload/chunk/create";
	public readonly completeRoute = "/api/v1/upload/chunk/complete";
	public readonly chunkSize = 50; // 50.0 MB

	/** The file to upload */
	public readonly file: File;
	/** The total amount of chunks for this upload */
	public totalChunks: number;

	public constructor(file: File) {
		this.file = file;
		this.totalChunks = Math.ceil(this.file.size / (this.chunkSize * 1e3 * 1e3));
	}

	public async upload(opt: UploadOptions) {
		if (this.totalChunks === 1) {
			const formData = new FormData();
			formData.append("file", this.file);
			formData.append("visible", `${opt.visible}`);

			const response = await axios.post<any>("/api/v1/upload", formData, {
				headers: { "Content-Type": "multipart/form-data" },
				withCredentials: true
			});

			return response.data.url;
		}

		const handlerId = await this.getHandlerId(opt);
		for (let i = 0; i < this.totalChunks; i++) {
			const chunk = await this.getNextChunk(i);
			await this.uploadChunk(chunk, handlerId);
		}

		const url = await this.complete(handlerId);
		return url;
	}

	private async complete(id: string) {
		await axios.post(this.completeRoute, { id }, { withCredentials: true });
		let fileUrl: string | null = null;

		while (!fileUrl) {
			await new Promise((res) => setTimeout(res, 5e3));
			const response = await axios.post<{ status: string; url: string | null }>(this.completeRoute, { id }, { withCredentials: true });
			fileUrl = response.data.url;
		}

		return fileUrl;
	}

	private async uploadChunk(chunk: Blob, id: string) {
		const formData = new FormData();
		formData.append("file", chunk);
		formData.append("partial-file-id", id);

		await axios.post(this.uploadRoute, formData, {
			headers: { "Content-Type": "multipart/form-data" },
			withCredentials: true
		});
	}

	/**
	 * Fetches a partialfile handler id
	 * @param opt The file options
	 * @returns
	 */
	private async getHandlerId(opt: UploadOptions) {
		const handler = await axios<{ id: string }>(this.createRoute, {
			data: { visible: opt.visible, filename: opt.name, password: opt.password, mimeType: this.file.type },
			method: "POST",
			withCredentials: true
		});
		return handler.data.id;
	}

	/** Returns the next file chunk */
	private getNextChunk(index: number) {
		return new Promise<Blob>((res) => {
			const length = this.chunkSize * 1e3 * 1e3;
			const start = length * index;

			const fileReader = new FileReader();
			fileReader.readAsArrayBuffer(this.file.slice(start, start + length));
			fileReader.onload = () => res(new Blob([fileReader.result!], { type: "application/octet-stream" }));
		});
	}
}

export interface UploadOptions {
	visible: boolean;
	password?: string | undefined;
	name?: string | undefined;
}

import type { AxiosError } from "axios";
import React, { useEffect, useState } from "react";
import { fetch, getCancelToken } from "../../../../../lib/fetch";
import { useAuth } from "../../../../../lib/hooks/useAuth";
import type { ApiError, FC } from "../../../../../lib/types";

interface Props {
	file: File;
}

const UploadItem: FC<Props> = ({ file }) => {
	const { user } = useAuth();
	const { cancel, token } = getCancelToken();

	const [progress, setProgress] = useState(0);
	const [uploaded, setUploaded] = useState(false);
	const [fileData] = useState({ name: file.name.split(".")[0], extension: file.name.split(".").slice(1).join(".") });

	const formatBytes = (bytes: number): string => {
		const units = ["B", "kB", "MB", "GB", "TB", "PB"];
		let num = 0;

		while (bytes > 1024) {
			bytes /= 1024;
			++num;
		}

		return `${bytes.toFixed(1)} ${units[num]}`;
	};

	const func = async () => {
		if (uploaded) return;

		const data = new FormData();
		data.append("upload", file);

		try {
			await fetch("/api/upload", token, {
				method: "POST",
				data,
				cancelToken: token,
				headers: { Authorization: user?.token ?? "", "Content-Type": "multipart/form-data" },
				onUploadProgress: (ev) => setProgress(Math.round((100 * ev.loaded) / ev.total))
			});

			setUploaded(true);
		} catch (error) {
			if (!error || typeof error !== "object") return;
			if (error instanceof Error && error.message === "cancelled") return;
			if (!("isAxiosError" in error)) return;

			const err = error as AxiosError<ApiError>;
			console.error(err);
			// alert("Something went wrong while uploading a file", err.response?.data.message ?? "Unknown error, please try again later.");
		}
	};

	useEffect(() => {
		void func();
		return () => cancel("cancelled");
	}, []);

	return (
		<div className="upload-modal-uploaded-file">
			<i className="fa-solid fa-file-lines" />
			<div className="uploaded-modal-uploaded-file-details">
				<span className="uploaded-modal-uploaded-file-title">
					<p>{fileData.name}</p>
					<p>.{fileData.extension}</p>
					<p id="state">• {uploaded ? "Uploaded" : "Uploading"}</p>
				</span>
				{uploaded ? (
					<p>{formatBytes(file.size)}</p>
				) : (
					<div className="upload-modal-progressbar">
						<div style={{ width: `${progress}%` }} />
					</div>
				)}
			</div>
			{uploaded ? (
				<p>
					<i className="fa-solid fa-check" />
				</p>
			) : (
				<p>{progress}%</p>
			)}
		</div>
	);
};

export default UploadItem;

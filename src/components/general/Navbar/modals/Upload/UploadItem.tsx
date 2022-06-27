import type { AxiosError } from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { fetch, getCancelToken } from "../../../../../lib/fetch";
import { useAuth } from "../../../../../lib/hooks/useAuth";
import type { ApiError, FC } from "../../../../../lib/types";
import Button from "../../../Button";

interface Props {
	file: File;
}

const UploadItem: FC<Props> = ({ file }) => {
	const { user } = useAuth();
	const { cancel, token } = getCancelToken();

	const [progress, setProgress] = useState(0);
	const [uploaded, setUploaded] = useState(false);
	const [isError, setIsError] = useState(false);

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
			const errMsg = err.response?.data.message ?? "Unknown error, please try again later.";

			toast.error(`UPLOAD ERROR: ${errMsg}`);
			console.error("Something went wrong while uploading a file", errMsg);
			setIsError(true);
		}
	};

	const runAgain = () => {
		setProgress(0);
		setUploaded(false);
		setIsError(false);

		void func();
	};

	useEffect(() => {
		void func();
		return () => cancel("cancelled");
	}, []);

	return (
		<div className="upload-modal-uploaded-file">
			<i className="fa-solid fa-file-lines" />
			<div className="uploaded-modal-uploaded-file-details">
				<p className="uploaded-modal-uploaded-file-title">{file.name}</p>
				{isError ? (
					<p>ERROR - TRY AGAIN</p>
				) : uploaded ? (
					<p>{formatBytes(file.size)}</p>
				) : (
					<div className="upload-modal-progressbar">
						<div style={{ width: `${progress}%` }} />
					</div>
				)}
			</div>
			{isError ? (
				<Button type="button" style="text" onClick={runAgain}>
					<i className="fa-solid fa-arrows-rotate" />
				</Button>
			) : uploaded ? (
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

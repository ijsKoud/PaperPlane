import { TransparentButton } from "@paperplane/buttons";
import { formatBytes } from "@paperplane/utils";
import type { AxiosError, CancelTokenSource } from "axios";
import axios from "axios";
import React, { useEffect, useState } from "react";
import Uploader from "huge-uploader";

interface Props {
	file: File;
	toastError: (str: string) => void;
}

const UploadItem: React.FC<Props> = ({ file, toastError }) => {
	const [progress, setProgress] = useState(0);
	const [uploaded, setUploaded] = useState(false);
	const [isError, setIsError] = useState(false);

	const func = (token: CancelTokenSource) => {
		if (uploaded) return;

		const data = new FormData();
		data.append("upload", file);

		try {
			const uploader = new Uploader({ endpoint: "/api/upload-chunk", file, postParams: { type: file.type } });
			uploader
				.on("finish", () => setUploaded(true))
				.on("progress", (d) => setProgress(d.detail))
				.on("error", console.error);

			setUploaded(true);
		} catch (error) {
			if (!error || typeof error !== "object") return;
			if (error instanceof Error && error.message === "cancelled") return;
			if (!("isAxiosError" in error)) return;

			const err = error as AxiosError<{ message: string }>;
			const errMsg = err.response?.data.message ?? "Unknown error, please try again later.";

			toastError(`UPLOAD ERROR: ${errMsg}`);
			console.error("Something went wrong while uploading a file", errMsg);
			setIsError(true);
		}
	};

	const runAgain = () => {
		const token = axios.CancelToken.source();
		setProgress(0);
		setUploaded(false);
		setIsError(false);

		void func(token);
		window.onbeforeunload = () => token.cancel("cancelled");
	};

	useEffect(() => {
		const token = axios.CancelToken.source();
		void func(token);

		return () => token.cancel("cancelled");
	}, []);

	return (
		<div className="w-full bg-main py-2 px-4 rounded-xl flex items-center justify-between">
			<i className="fa-solid fa-file-lines text-indigo-500 text-2xl" />
			<div className="w-full pl-4">
				<p className="text-base font-medium">{file.name}</p>
				{isError ? (
					<p className="text-small font-normal">ERROR - TRY AGAIN</p>
				) : uploaded ? (
					<p className="text-small font-normal">{formatBytes(file.size)}</p>
				) : (
					<div className="w-[calc(100%-20px)] h-2 rounded-md bg-bg-dark mt-2">
						<div className="h-full max-w-full rounded-md bg-indigo-500" style={{ width: `${progress}%` }} />
					</div>
				)}
			</div>
			{isError ? (
				<TransparentButton
					type="button"
					onClick={runAgain}
					className="text-2xl text-indigo-500 hover:text-indigo-500 hover:animate-[spin_1s]"
				>
					<i className="fa-solid fa-arrows-rotate" />
				</TransparentButton>
			) : uploaded ? (
				<p className="text-2xl text-indigo-500">
					<i className="fa-solid fa-check" />
				</p>
			) : (
				<p>{progress}%</p>
			)}
		</div>
	);
};

export default UploadItem;

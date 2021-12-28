import type { AxiosError } from "axios";
import React, { useEffect, useState } from "react";
import { ApiError, fetch, getCancelToken } from "../../../lib";
import { useAuth } from "../../../lib/hooks/useAuth";
import { alert } from "../../../lib/notifications";
import ToolTip from "../../general/ToolTip";

interface Props {
	file: File;
	index: number;
}

const FileUploadItem: React.FC<Props> = ({ file, index }) => {
	const { user } = useAuth();
	const [progress, setProgress] = useState(0);
	const { cancel, token } = getCancelToken();

	const func = async () => {
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
		} catch (error) {
			if (!error || typeof error !== "object") return;
			if (error instanceof Error && error.message === "cancelled") return;
			if (!("isAxiosError" in error)) return;

			const err = error as AxiosError<ApiError>;
			alert("Something went wrong while uploading a file", err.response?.data.message ?? "Unknown error, please try again later.");
		}
	};

	useEffect(() => {
		void func();
		return () => cancel("cancelled");
	}, []);

	return (
		<div className="file-upload-item">
			<p>{file.name}</p>
			<ToolTip content={`${progress}%`}>
				<div className="file-progress-bar">
					<div className="file-progress" style={{ width: `${progress}%` }} />
				</div>
			</ToolTip>
		</div>
	);
};

export default FileUploadItem;

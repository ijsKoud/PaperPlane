import React, { useEffect, useState } from "react";
import { fetch, getCancelToken } from "../../../lib";
import { useAuth } from "../../../lib/hooks/useAuth";
import ToolTip from "../../general/ToolTip";

interface Props {
	file: File;
	index: number;
}

const FileUploadItem: React.FC<Props> = ({ file, index }) => {
	const { user } = useAuth();
	const [progress, setProgress] = useState(0);
	const { cancel, token } = getCancelToken();

	useEffect(() => {
		const data = new FormData();
		data.append("upload", file);
		fetch("/api/upload", token, {
			method: "POST",
			data,
			headers: { Authorization: user?.token ?? "", "Content-Type": "multipart/form-data" },
			onUploadProgress: (ev) => setProgress(Math.round((100 * ev.loaded) / ev.total))
		}).catch(() => void 0);

		return () => cancel();
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

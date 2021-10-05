import { ThreeDots } from "@agney/react-loading";
import { AxiosError } from "axios";
import React, { useState } from "react";
import DropZone from "react-dropzone";
import getSettings from "../../../../settings";
import { fetch } from "../../../lib/fetch";
import { useAuth } from "../../../lib/hooks/useAuth";
import { alert, success } from "../../../lib/notifications";
import { ApiError } from "../../../lib/types";

export const FileUpload: React.FC = () => {
	const { user } = useAuth();
	const [files, setFiles] = useState<File[]>([]);
	const [submitting, setSubmitting] = useState(false);

	const onDrop = (acceptedFiles: File[]) => {
		setFiles([...files, ...acceptedFiles]);
	};

	const deleteFile = (index: number): void => {
		setFiles(files.filter((_, i) => i !== index));
	};

	const onFileSubmit = async () => {
		const formData = new FormData();
		files.forEach((file) => formData.append("upload", file));

		setSubmitting(true);
		try {
			await fetch("/upload", {
				data: formData,
				method: "POST",
				headers: {
					Authorization: user?.token ?? "",
					"Content-Type": "multipart/form-data",
				},
			});

			success("Files uploaded", `Successfully upload ${files.length} file(s)!`);
		} catch (err) {
			if (!("isAxiosError" in err)) return;

			const error = err as AxiosError<ApiError>;
			alert("Upload failed", `${error.response?.data.message ?? "Unknown error"}`);
			console.error(error.response?.data.error ?? "Unknown error");
		}

		setSubmitting(false);
		setFiles([]);
	};

	return (
		<div className="file-upload">
			<DropZone
				maxSize={getSettings().uploadLimit}
				onDrop={(acceptedFiles) => onDrop(acceptedFiles as any)}>
				{({ getRootProps, getInputProps, isDragActive }) => (
					<div {...getRootProps({ className: "file-uploader-container" })}>
						<input {...getInputProps()} />
						{isDragActive ? <h1>Drag them here!!</h1> : <h1>Drag and drop files here</h1>}
					</div>
				)}
			</DropZone>
			<ul className="file-upload-files">
				{files.map((file, i) => (
					<li key={i}>
						{!submitting && <i className="fas fa-times" onClick={() => deleteFile(i)} />}
						<p>{file.name}</p>
					</li>
				))}
			</ul>
			{submitting ? (
				<ThreeDots style={{ width: 100 }} />
			) : (
				<button className="file-upload-button" onClick={onFileSubmit}>
					<i className="fas fa-cloud" /> Upload
				</button>
			)}
		</div>
	);
};

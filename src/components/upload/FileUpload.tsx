import React, { useState } from "react";
import DropZone from "react-dropzone";
import settings from "../../lib/settings";
import FileUploadItem from "./components/FileUploadItem";

const FileUpload: React.FC = () => {
	const [files, setFiles] = useState<File[]>([]);

	const onDrop = (acceptedFiles: File[]) => {
		setFiles([...files, ...acceptedFiles]);
	};

	return (
		<div className="file-upload">
			<DropZone maxSize={settings.maxFileSize} onDrop={(acceptedFiles: File[]) => onDrop(acceptedFiles)}>
				{({ getRootProps, getInputProps, isDragActive }) => (
					<div {...getRootProps({ className: "file-uploader-container" })}>
						<input {...getInputProps()} />
						{isDragActive ? <h1>Drag them here!!</h1> : <h1>Drag and drop files here</h1>}
					</div>
				)}
			</DropZone>
			<div className="file-uploader-items">
				{files.map((file, i) => (
					<FileUploadItem key={i} file={file} index={i} />
				))}
			</div>
		</div>
	);
};

export default FileUpload;

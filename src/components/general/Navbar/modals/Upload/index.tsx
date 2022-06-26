import React, { useState } from "react";
import Dropzone from "react-dropzone";
import type { FC } from "../../../../../lib/types";
import Button from "../../../Button";
import Modal from "../../../Modal";
import UploadItem from "./UploadItem";

interface Props {
	onClick: () => void;
	isOpen: boolean;
}

const UploadModal: FC<Props> = (props) => {
	const [files, setFiles] = useState<File[]>([]);

	const onClick = () => {
		props.onClick();
		setFiles([]);
	};

	return (
		<Modal isOpen={props.isOpen} onClick={onClick}>
			<div className="upload-modal-content">
				<div className="upload-modal-top">
					<h1 className="upload-modal-title">Upload a file</h1>
					<Button type="button" style="text" onClick={onClick}>
						<i className="fa-solid fa-times" />
					</Button>
				</div>
				<div className="upload-modal-upload">
					<Dropzone onDropAccepted={(f) => setFiles([...files, ...f])}>
						{({ getRootProps, getInputProps }) => (
							<div {...getRootProps()} className="upload-modal-dropzone">
								<input {...getInputProps()} />
								<div className="upload-modal-dropzone-content">
									<i className="fa-solid fa-cloud-arrow-up" />
									<p>Select a file or drag & drop them to upload it!</p>
								</div>
							</div>
						)}
					</Dropzone>
					<div className="upload-modal-uploaded-list">
						{files.map((file, key) => (
							<UploadItem key={key} file={file} />
						))}
					</div>
				</div>
			</div>
		</Modal>
	);
};

export default UploadModal;

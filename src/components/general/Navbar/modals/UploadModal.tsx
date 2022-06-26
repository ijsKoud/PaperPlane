import React from "react";
import Dropzone from "react-dropzone";
import type { FC } from "../../../../lib/types";
import Button from "../../Button";
import Modal from "../../Modal";

interface Props {
	onClick: () => void;
	isOpen: boolean;
}

const UploadModal: FC<Props> = (props) => {
	return (
		<Modal {...props}>
			<div className="upload-modal-content">
				<div className="upload-modal-top">
					<h1 className="upload-modal-title">Upload a file</h1>
					<Button type="button" style="text" onClick={props.onClick}>
						<i className="fa-solid fa-times" />
					</Button>
				</div>
				<div className="upload-modal-upload">
					<Dropzone onDropAccepted={(f) => console.log(f.map((fl) => fl.name))}>
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
						<div className="upload-modal-uploaded-file">
							<i className="fa-solid fa-file-lines" />
							<div className="uploaded-modal-uploaded-file-details">
								<p className="uploaded-modal-uploaded-file-title">
									<p>test</p>
									<p>.mp4</p>
									<p id="state">• Uploading</p>
								</p>
								<div className="upload-modal-progressbar">
									<div style={{ width: "75%" }} />
								</div>
							</div>
							<p>75%</p>
						</div>
						<div className="upload-modal-uploaded-file">
							<i className="fa-solid fa-file-lines" />
							<div className="uploaded-modal-uploaded-file-details">
								<p className="uploaded-modal-uploaded-file-title">
									<p>test</p>
									<p>.mp4</p>
									<p id="state">• Error</p>
								</p>
								<p>2.4 MB</p>
							</div>
							<p>
								<i className="fa-solid fa-arrows-rotate" />
							</p>
						</div>
						<div className="upload-modal-uploaded-file">
							<i className="fa-solid fa-file-lines" />
							<div className="uploaded-modal-uploaded-file-details">
								<p className="uploaded-modal-uploaded-file-title">
									<p>test</p>
									<p>.mp4</p>
									<p id="state">• Uploaded</p>
								</p>
								<p>2.4 MB</p>
							</div>
							<p>
								<i className="fa-solid fa-check" />
							</p>
						</div>
					</div>
				</div>
			</div>
		</Modal>
	);
};

export default UploadModal;

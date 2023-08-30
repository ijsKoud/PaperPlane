import { Modal } from "@paperplane/modal";
import type React from "react";
import { useState } from "react";
import Dropzone from "react-dropzone";
import UploadItem from "./UploadModalItem";

interface Props {
	isOpen: boolean;

	toastError: (str: string) => void;
	onClick: () => void;
}

export const UploadModal: React.FC<Props> = (props) => {
	const [files, setFiles] = useState<File[]>([]);

	const onClick = () => {
		props.onClick();
		setFiles([]);
	};

	return (
		<Modal {...props} onClick={onClick}>
			<div className="w-[clamp(290px,50vw,750px)] p-4 min-h-[35rem]">
				<h1 className="text-3xl">Upload a file</h1>
				<div className="w-full h-64 mt-4 rounded-md border border-dashed border-white-500">
					<Dropzone onDropAccepted={(f) => setFiles([...files, ...f])}>
						{({ getRootProps, getInputProps }) => (
							<div {...getRootProps()} className="grid place-items-center w-full h-full">
								<input {...getInputProps()} />
								<div className="flex flex-col items-center justify-center text-xl text-center">
									<i className="fa-solid fa-cloud-arrow-up" />
									<p>Select a file or drag & drop them to upload it!</p>
								</div>
							</div>
						)}
					</Dropzone>
					<div className="max-h-[13rem] overflow-y-auto mt-4 flex flex-col gap-y-2 pr-2">
						{files.map((file, key) => (
							<UploadItem key={key} file={file} toastError={props.toastError} />
						))}
					</div>
				</div>
			</div>
		</Modal>
	);
};

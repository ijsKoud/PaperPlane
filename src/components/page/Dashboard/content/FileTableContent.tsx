import "moment-timezone";
import moment from "moment";
import React, { useState } from "react";
import type { ApiFile, FC } from "../../../../lib/types";
import copy from "copy-to-clipboard";
import { toast } from "react-toastify";
import Button from "../../../general/Button";
import { fetch } from "../../../../lib/fetch";
import FileEditModal from "../modals/FileEditModal";
import ToolTip from "../../../general/ToolTip";

interface Props {
	file: ApiFile;

	updateFileList: () => void;
	selectFile: (id: string) => void;
}

const FileTableContent: FC<Props> = ({ file, updateFileList, selectFile }) => {
	const [showModal, setShowModal] = useState(false);

	const getImageURL = (name: string): string => `/files/${name}`;
	const getDate = (date: Date): string => moment(date).format("DD/MM/YYYY HH:mm:ss");

	const copyUrl = () => {
		copy(file.url);
		toast.info("URL copied to your clipboard");
	};

	const deleteFile = async () => {
		try {
			const deletePromise = fetch("/api/dashboard/files/update", undefined, { method: "DELETE", data: { id: file.name } });
			await toast.promise(deletePromise, {
				error: "Unable to delete the file, please try again later.",
				success: `Successfully deleted ${file.name}`,
				pending: `Attempting to delete ${file.name}`
			});
		} catch (err) {}

		updateFileList();
	};

	const onClick = () => setShowModal(false);
	const onEditClick = () => setShowModal(true);

	return (
		<>
			<tr>
				<td>
					{file.isImage ? (
						<img
							width={256}
							height={144}
							className="dashboard-table-image"
							loading="lazy"
							src={getImageURL(`${file.name}?preview=true`)}
							alt={file.name}
						/>
					) : (
						<i className="fa-solid fa-file" />
					)}
				</td>
				<td>{file.name}</td>
				<td>{file.size}</td>
				<td>
					<div className="dashboard-table-visibility">
						<ToolTip content={`Password Protection: ${file.pwdProtection ? "on" : "off"}`}>
							<i className={file.pwdProtection ? "fa-solid fa-lock" : "fa-solid fa-lock-open"} />
						</ToolTip>
						<ToolTip content={`Visibility: ${file.visible ? "everyone" : "you"}`}>
							<i className={file.visible ? "fa-solid fa-eye" : "fa-solid fa-eye-slash"} />
						</ToolTip>
					</div>
				</td>
				<td>
					{file.views} {file.views === 1 ? "view" : "views"}
				</td>
				<td>{getDate(file.date)}</td>
				<td className="dashboard-table-buttons">
					<div>
						<FileEditModal
							{...{ isOpen: showModal, onClick, name: file.name, visible: file.visible, password: file.password ?? "", updateFileList }}
						/>
						<Button type="link" url={file.url} style="blurple" newWindow>
							<i className="fa-solid fa-square-arrow-up-right" />
						</Button>
						<Button type="button" onClick={copyUrl} style="success">
							<i className="fa-solid fa-link" />
						</Button>
						<Button type="button" onClick={onEditClick} style="yellow">
							<i className="fa-solid fa-pen-to-square" />
						</Button>
					</div>
				</td>
				<td className="dashboard-table-buttons">
					<div>
						<input type="checkbox" onChange={() => selectFile(file.name.split(".")[0])} />
						<Button type="button" onClick={deleteFile} style="danger">
							<i className="fa-solid fa-trash-can" />
						</Button>
					</div>
				</td>
			</tr>
		</>
	);
};

export default FileTableContent;

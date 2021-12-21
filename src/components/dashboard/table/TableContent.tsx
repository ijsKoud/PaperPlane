import copy from "copy-to-clipboard";
import saveAs from "file-saver";
import React, { useState } from "react";
import ToolTip from "../../general/ToolTip";
// import { isMobile } from "react-device-detect";
// import Modal from "../../../modal";
// import ConfirmModal from "../confirmModal";
// import EditFile from "../editItem/editFile";
// import EditLink from "../editItem/editLink";

interface FileProps {
	type: "file";
	fileLink: string;
	apiFileLink: string;
	name: string;
	size: string;
	date: string;
	preview: JSX.Element;
	deleteFile: (name: string) => void;
	fetchFiles: () => void;
}

interface LinkProps {
	type: "link";
	path: string;
	url: string;
	date: string;
	shortLink: string;
	deleteLink: (path: string) => void;
	fetchLinks: () => void;
}

type Props = FileProps | LinkProps;

const TableContent: React.FC<Props> = (props) => {
	const { type } = props;
	const [open, setOpen] = useState(false);
	const [openDelete, setOpenDelete] = useState(false);

	if (type === "file") {
		const { preview, name, size, date, fileLink, apiFileLink, deleteFile, fetchFiles } = props;

		const copyLink = () => copy(apiFileLink);
		const download = () => saveAs(apiFileLink, name);

		const handleClose = () => {
			fetchFiles();
			setOpen(false);
		};

		const handleCancel = () => {
			fetchFiles();
			setOpenDelete(false);
		};

		const handleAccept = () => {
			deleteFile(name);
			setOpenDelete(false);
		};

		return (
			<tr>
				<td>{preview}</td>
				<td>{name}</td>
				<td>{size}</td>
				<td>{date}</td>
				<td>
					{/* <Modal onClick={() => setOpen(false)} isOpen={open}>
						<EditFile name={name} handleClose={handleClose} />
					</Modal>
					<Modal onClick={() => setOpenDelete(false)} isOpen={openDelete}>
						<ConfirmModal handleCancel={handleCancel} handleAccept={handleAccept} />
					</Modal> */}
					<div className="dashboard__table-buttons">
						<ToolTip content="Open in browser">
							<a href={fileLink} target="_blank" rel="noreferrer">
								<i className="open fas fa-external-link-alt" />
							</a>
						</ToolTip>
						<ToolTip content="Download the file">
							<button onClick={download}>
								<i className="download fas fa-cloud-download-alt" />
							</button>
						</ToolTip>
						<ToolTip content="Copy the link">
							<button onClick={copyLink}>
								<i className="copy fas fa-link" />
							</button>
						</ToolTip>
						<ToolTip content="Edit the file name">
							<button onClick={() => setOpen(true)}>
								<i className="edit fas fa-edit" />
							</button>
						</ToolTip>
						<ToolTip content="Delete the file">
							<button onClick={() => setOpenDelete(true)}>
								<i className="delete fas fa-trash" />
							</button>
						</ToolTip>
					</div>
				</td>
			</tr>
		);
	}

	const { path, url, date, shortLink, deleteLink, fetchLinks } = props;

	const handleClose = () => {
		fetchLinks();
		setOpen(false);
	};

	const handleCancel = () => {
		fetchLinks();
		setOpenDelete(false);
	};

	const handleAccept = () => {
		deleteLink(path);
		setOpenDelete(false);
	};

	return (
		<tr>
			<td>{path}</td>
			<td>{url}</td>
			<td>{date}</td>
			<td>
				{/* <Modal onClick={() => setOpen(false)} isOpen={open}>
					<EditLink link={{ url, path, date }} handleClose={handleClose} />
				</Modal>
				<Modal onClick={() => setOpenDelete(false)} isOpen={openDelete}>
					<ConfirmModal handleCancel={handleCancel} handleAccept={handleAccept} />
				</Modal> */}
				<div className="dashboard__table-buttons">
					<ToolTip content="Open in browser">
						<a href={shortLink} target="_blank" rel="noreferrer">
							<i className="open fas fa-external-link-alt" />
						</a>
					</ToolTip>
					<ToolTip content="Copy the link">
						<button onClick={() => copy(shortLink)}>
							<i className="copy fas fa-link" />
						</button>
					</ToolTip>
					<ToolTip content="Edit the link">
						<button onClick={() => setOpen(true)}>
							<i className="edit fas fa-edit" />
						</button>
					</ToolTip>
					<ToolTip content="Delete the link">
						<button onClick={() => setOpenDelete(true)}>
							<i className="delete fas fa-trash" />
						</button>
					</ToolTip>
				</div>
			</td>
		</tr>
	);
};

export default TableContent;

import Tippy from "@tippyjs/react";
import copy from "copy-to-clipboard";
import React, { useState } from "react";
import { isMobile } from "react-device-detect";
import Modal from "../../../modal";
import EditFile from "../editItem/editFile";

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
}

type Props = FileProps | LinkProps;

const TableContent: React.FC<Props> = (props) => {
	const { type } = props;

	if (type === "file") {
		const { preview, name, size, date, fileLink, apiFileLink, deleteFile, fetchFiles } = props;
		const [open, setOpen] = useState(false);

		const copyLink = () => copy(fileLink);
		const download = () => saveAs(apiFileLink, name);

		const handleClose = () => {
			fetchFiles();
			setOpen(false);
		};

		return (
			<>
				<tr>
					<td>{preview}</td>
					<td>{name}</td>
					<td>{size}</td>
					<td>{date}</td>
					<td>
						<Modal onClick={() => setOpen(false)} isOpen={open}>
							<EditFile name={name} handleClose={handleClose} />
						</Modal>
						<div className="dashboard__table-buttons">
							<Tippy duration={5e2} disabled={isMobile} content={<p>Open in browser</p>}>
								<i
									className="open fas fa-external-link-alt"
									onClick={() => window.open(fileLink)}
								/>
							</Tippy>
							<Tippy duration={5e2} disabled={isMobile} content={<p>Download the file</p>}>
								<i className="download fas fa-cloud-download-alt" onClick={download} />
							</Tippy>
							<Tippy duration={5e2} disabled={isMobile} content={<p>Copy the link</p>}>
								<i className="copy fas fa-link" onClick={copyLink} />
							</Tippy>
							<Tippy duration={5e2} disabled={isMobile} content={<p>Edit the file name</p>}>
								<i className="edit fas fa-edit" onClick={() => setOpen(true)} />
							</Tippy>
							<Tippy duration={5e2} disabled={isMobile} content={<p>Delete the file</p>}>
								<i className="delete fas fa-trash" onClick={() => deleteFile(name)} />
							</Tippy>
						</div>
					</td>
				</tr>
			</>
		);
	}
	return <div></div>;
};

export default TableContent;

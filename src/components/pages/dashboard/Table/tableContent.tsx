import Tippy from "@tippyjs/react";
import copy from "copy-to-clipboard";
import React, { useState } from "react";
import Modal from "../../../modal";

interface FileProps {
	type: "file";
	fileLink: string;
	apiFileLink: string;
	name: string;
	size: string;
	date: string;
	preview: JSX.Element;
	deleteFile: (name: string) => void;
}

interface LinkProps {
	type: "link";
}

type Props = FileProps | LinkProps;

const TableContent: React.FC<Props> = (props) => {
	const { type } = props;

	if (type === "file") {
		const { preview, name, size, date, fileLink, apiFileLink, deleteFile } = props;
		const [open, setOpen] = useState(false);

		const copyLink = () => copy(fileLink);
		const download = () => saveAs(apiFileLink, name);

		return (
			<>
				<tr>
					<td>{preview}</td>
					<td>{name}</td>
					<td>{size}</td>
					<td>{date}</td>
					<td>
						<Modal onClick={() => setOpen(false)} isOpen={open}>
							<div>
								<p>Hello</p>
							</div>
						</Modal>
						<div className="dashboard__table-buttons">
							<Tippy duration={5e2} content={<p>Open in browser</p>}>
								<i
									className="open fas fa-external-link-alt"
									onClick={() => window.open(fileLink)}
								/>
							</Tippy>
							<Tippy duration={5e2} content={<p>Download the file</p>}>
								<i className="download fas fa-cloud-download-alt" onClick={download} />
							</Tippy>
							<Tippy duration={5e2} content={<p>Copy the link</p>}>
								<i className="copy fas fa-link" onClick={copyLink} />
							</Tippy>
							<Tippy duration={5e2} content={<p>Edit the file name</p>}>
								<i className="edit fas fa-edit" onClick={() => setOpen(true)} />
							</Tippy>
							<Tippy duration={5e2} content={<p>Delete the file</p>}>
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

import "moment-timezone";
import moment from "moment";
import React from "react";
import type { ApiFile, FC } from "../../../../lib/types";
import copy from "copy-to-clipboard";
import { toast } from "react-toastify";
import Button from "../../../general/Button";

interface Props {
	file: ApiFile;
}

const FileTableContent: FC<Props> = ({ file }) => {
	const getImageURL = (name: string): string => `/files/${name}`;
	const getDate = (date: Date): string => moment(date).format("DD/MM/YYYY HH:mm:ss");

	const copyUrl = () => {
		copy(file.url);
		toast.info("URL copied to your clipboard");
	};

	return (
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
			<td>{file.pwdProtection ? <i className="fa-solid fa-check" /> : <i className="fa-solid fa-times" />}</td>
			<td>
				{file.views} {file.views === 1 ? "view" : "views"}
			</td>
			<td>{getDate(file.date)}</td>
			<td>open, copy, edit, delete</td>
			<td>Select button</td>
		</tr>
	);
};

export default FileTableContent;

import "moment-timezone";

import React, { useEffect, useState } from "react";
import { fetch, getCancelToken } from "../../../lib/fetch";
import type { ApiFile, FC } from "../../../lib/types";
import moment from "moment";

interface Props {
	protocol: string;
}

const FilesList: FC<Props> = ({ protocol }) => {
	const [files, setFiles] = useState<ApiFile[]>([]);

	const getURL = (partialUrl: string): string => `${protocol}//${partialUrl}`;
	const getImageURL = (name: string): string => `/files/${name}`;

	const getDate = (date: Date): string => moment(date).format("DD/MM/YYYY HH:mm:ss");

	useEffect(() => {
		const token = getCancelToken();
		fetch<ApiFile[]>("/api/dashboard/files", token.token)
			.then((res) => setFiles(res.data))
			.catch(() => void 0);

		return () => token.cancel("cancelled");
	}, []);

	return (
		<div className="dashboard-list">
			<table className="dashboard-table">
				<colgroup>
					<col span={1} style={{ width: 250 }} />
					<col span={1} style={{ width: 250 }} />
					<col span={1} style={{ width: 150 }} />
					<col span={1} style={{ width: 120 }} />
					<col span={1} style={{ width: 150 }} />
					<col span={1} style={{ width: 150 }} />
					<col span={1} style={{ width: 150 }} />
					<col span={1} style={{ width: 150 }} />
				</colgroup>
				<thead className="dashboard-table-head">
					<tr>
						<th>Preview</th>
						<th>Name</th>
						<th>Size</th>
						<th>Password</th>
						<th>Views</th>
						<th>Date</th>
						<th>Actions</th>
						<th>Delete</th>
					</tr>
				</thead>
				<tbody className="dashboard-table-content">
					{files.map((file) => (
						<tr key={file.name}>
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
							<td>
								<p>{file.name}</p>
							</td>
							<td>
								<p>{file.size}</p>
							</td>
							<td>
								<p>{file.pwdProtection ? <i className="fa-solid fa-check" /> : <i className="fa-solid fa-times" />}</p>
							</td>
							<td>
								<p>
									{file.views} {file.views === 1 ? "view" : "views"}
								</p>
							</td>
							<td>
								<p>{getDate(file.date)}</p>
							</td>
							<td>
								<p>buttons</p>
							</td>
							<td>
								<p>Select button</p>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default FilesList;

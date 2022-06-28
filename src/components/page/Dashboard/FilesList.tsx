import "moment-timezone";

import React, { useEffect, useState } from "react";
import { fetch, getCancelToken } from "../../../lib/fetch";
import type { ApiFile, FC } from "../../../lib/types";
import moment from "moment";
import Table from "./base/Table";
import FileTableContent from "./base/FileTableContent";

interface Props {
	protocol: string;
}

const FilesList: FC<Props> = ({ protocol }) => {
	const [files, setFiles] = useState<ApiFile[]>([]);
	const getURL = (partialUrl: string): string => `${protocol}//${partialUrl}`;

	useEffect(() => {
		const token = getCancelToken();
		fetch<ApiFile[]>("/api/dashboard/files", token.token)
			.then((res) => setFiles(res.data.map((res) => ({ ...res, url: getURL(res.url) }))))
			.catch(() => void 0);

		return () => token.cancel("cancelled");
	}, []);

	return (
		<div className="dashboard-list">
			<Table
				columns={[250, 250, 150, 120, 150, 150, 150, 150]}
				keys={["Preview", "Name", "Size", "Password", "Views", "Date", "Actions", "Delete"]}
			>
				{files.map((file) => (
					<FileTableContent key={file.name} file={file} />
				))}
			</Table>
		</div>
	);
};

export default FilesList;

import "moment-timezone";

import React, { useEffect, useState } from "react";
import { fetch, getCancelToken } from "../../../lib/fetch";
import type { ApiFile, FC } from "../../../lib/types";
import Table from "./base/Table";
import FileTableContent from "./base/FileTableContent";
import FilterBar from "./base/FilterBar";

interface Props {
	protocol: string;
}

const FilesList: FC<Props> = ({ protocol }) => {
	const [files, setFiles] = useState<ApiFile[]>([]);
	const [page, setPage] = useState(1);
	const [searchQuery, setSearchQuery] = useState("");
	const [sort, setSort] = useState("default");

	const getURL = (partialUrl: string): string => `${protocol}//${partialUrl}`;

	useEffect(() => {
		const token = getCancelToken();
		const params = new URLSearchParams({ search: searchQuery, sort, page: page.toString() }).toString();

		fetch<ApiFile[]>(`/api/dashboard/files?${params}`, token.token)
			.then((res) => setFiles(res.data.map((res) => ({ ...res, url: getURL(res.url) }))))
			.catch(() => void 0);

		return () => token.cancel("cancelled");
	}, [page, searchQuery, sort]);

	return (
		<div className="dashboard-list">
			<FilterBar page={page} pages={1} setPage={setPage} setSearchQuery={setSearchQuery} setSort={setSort} sortOptions={[""]} />
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

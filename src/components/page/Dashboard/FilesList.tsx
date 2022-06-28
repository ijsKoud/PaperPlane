import "moment-timezone";

import React, { useEffect, useState } from "react";
import { fetch, getCancelToken } from "../../../lib/fetch";
import { ApiFile, FC, FilesApiRes, FILE_SORT_OPTIONS } from "../../../lib/types";
import Table from "./base/Table";
import FileTableContent from "./base/FileTableContent";
import FilterBar from "./base/FilterBar";
import CollapseTable from "./base/CollapseTable";

interface Props {
	protocol: string;
}

const FilesList: FC<Props> = ({ protocol }) => {
	const [files, setFiles] = useState<ApiFile[]>([]);
	const [update, setUpdate] = useState(false); // used to trigger useEffect hook

	const [page, setPage] = useState(1);
	const [pages, setPages] = useState(1);
	const [searchQuery, setSearchQuery] = useState("");
	const [sort, setSort] = useState("default");

	const [showDelete, setShowDelete] = useState(false);

	const getURL = (partialUrl: string): string => `${protocol}//${partialUrl}`;

	useEffect(() => {
		const token = getCancelToken();
		const params = new URLSearchParams({ search: searchQuery, sort, page: page.toString() }).toString();

		const updateStates = (data: FilesApiRes) => {
			setFiles(data.files.map((res) => ({ ...res, url: getURL(res.url) })));
			setPages(data.pages);
		};

		fetch<FilesApiRes>(`/api/dashboard/files?${params}`, token.token)
			.then((res) => updateStates(res.data))
			.catch(() => void 0);

		return () => token.cancel("cancelled");
	}, [page, searchQuery, sort, update]);

	const selectFile = () => void 0;
	const updateFileList = () => setUpdate(!update);

	return (
		<CollapseTable title="Files">
			<FilterBar
				page={page}
				pages={pages}
				setPage={setPage}
				setSearchQuery={setSearchQuery}
				setSort={setSort}
				sortOptions={FILE_SORT_OPTIONS}
			/>
			<div className="dashboard-table-container">
				<Table
					columns={[250, 250, 150, 120, 150, 150, 150, 100]}
					keys={["Preview", "Name", "Size", "Password", "Views", "Date", "Actions", "Delete"]}
				>
					{files.map((file) => (
						<FileTableContent key={file.name} {...{ file, selectFile, updateFileList }} />
					))}
				</Table>
			</div>
		</CollapseTable>
	);
};

export default FilesList;

import "moment-timezone";

import React, { useEffect, useState } from "react";
import { fetch, getCancelToken } from "../../../lib/fetch";
import { ApiFile, FC, FilesApiRes, FILE_SORT_OPTIONS } from "../../../lib/types";
import Table from "./base/Table";
import FileTableContent from "./content/FileTableContent";
import FilterBar from "./base/FilterBar";
import CollapseTable from "./base/CollapseTable";
import { useFormik } from "formik";
import DeleteFilePopup from "./content/DeleteFilePopup";
import { toast } from "react-toastify";
import Loader from "../../general/Loader";

interface Props {
	protocol: string;
}

const FilesList: FC<Props> = ({ protocol }) => {
	const [files, setFiles] = useState<ApiFile[]>([]);
	const [update, setUpdate] = useState(false); // used to trigger useEffect hook
	const [loading, setLoading] = useState(false);

	const [page, setPage] = useState(1);
	const [pages, setPages] = useState(1);
	const [searchQuery, setSearchQuery] = useState("");
	const [sort, setSort] = useState("default");

	const formik = useFormik<Record<string, boolean>>({ initialValues: {}, onSubmit: () => void 0 });
	const getURL = (partialUrl: string): string => `${protocol}${partialUrl}`;

	useEffect(() => {
		const token = getCancelToken();
		const params = new URLSearchParams({ search: searchQuery, sort, page: page.toString() }).toString();

		const updateStates = (data: FilesApiRes) => {
			setFiles(data.files.map((res) => ({ ...res, url: getURL(res.url) })));
			setPages(data.pages);
		};

		fetch<FilesApiRes>(`/api/dashboard/files?${params}`, token.token)
			.then((res) => updateStates(res.data))
			.then(() => setLoading(false))
			.catch(() => toast.error("Unable to load the files list, please try again later."));

		return () => token.cancel("cancelled");
	}, [page, searchQuery, sort, update]);

	const updateFileList = () => setTimeout(() => setUpdate(!update), 1e2);
	const selectFile = (id: string) => {
		const field = formik.values[id];
		if (field) {
			const values = { ...formik.values };

			delete values[id];
			void formik.setValues(values);
		} else void formik.setFieldValue(id, true);
	};

	return (
		<CollapseTable title="Files">
			<DeleteFilePopup {...{ formik, updateFileList }} />
			<FilterBar
				id="files"
				page={page}
				pages={pages}
				setPage={setPage}
				setSearchQuery={setSearchQuery}
				setSort={setSort}
				sortOptions={FILE_SORT_OPTIONS}
			/>
			<div className="dashboard-table-container">
				{loading ? (
					<div style={{ display: "grid", placeItems: "center", width: "100%" }}>
						<Loader size={30} />
					</div>
				) : (
					<Table
						columns={[250, 250, 150, 120, 150, 150, 150, 130]}
						keys={["Preview", "Name", "Size", "Visibility", "Views", "Date", "Actions", "Delete"]}
					>
						{files.map((file) => (
							<FileTableContent key={file.name} {...{ file, selectFile, updateFileList }} />
						))}
					</Table>
				)}
			</div>
		</CollapseTable>
	);
};

export default FilesList;

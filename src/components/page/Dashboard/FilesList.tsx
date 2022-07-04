import "moment-timezone";

import React, { useState } from "react";
import { FC, FILE_SORT_OPTIONS, WebsocketMessageType } from "../../../lib/types";
import Table from "./base/Table";
import FileTableContent from "./content/FileTableContent";
import FilterBar from "./base/FilterBar";
import CollapseTable from "./base/CollapseTable";
import { useFormik } from "formik";
import DeleteFilePopup from "./content/DeleteFilePopup";
import { useAuth } from "../../../lib/hooks/useAuth";
import { stringify } from "../../../lib/WebsocketHandler";

interface Props {
	protocol: string;
}

const FilesList: FC<Props> = ({ protocol }) => {
	const [update, setUpdate] = useState(false); // used to trigger useEffect hook
	const [page, setPage] = useState(1);
	const auth = useAuth();

	const formik = useFormik<Record<string, boolean>>({ initialValues: {}, onSubmit: () => void 0 });

	const updateFileList = () => setTimeout(() => setUpdate(!update), 1e2);
	const selectFile = (id: string) => {
		const field = formik.values[id];
		if (field) {
			const values = { ...formik.values };

			delete values[id];
			void formik.setValues(values);
		} else void formik.setFieldValue(id, true);
	};

	const _setPage = (page: number) => {
		setPage(page);
		auth.websocket?.send(stringify({ t: WebsocketMessageType.SEARCH_FILE_UPDATE, d: { page } }));
	};

	const setSearchQuery = (query: string) => {
		auth.websocket?.send(stringify({ t: WebsocketMessageType.SEARCH_FILE_UPDATE, d: { query } }));
	};

	const setSortType = (sortType: string) => {
		auth.websocket?.send(stringify({ t: WebsocketMessageType.SEARCH_FILE_UPDATE, d: { sortType } }));
	};

	return (
		<CollapseTable title="Files">
			<DeleteFilePopup {...{ formik, updateFileList }} />
			<FilterBar
				id="files"
				page={page}
				pages={auth.filePages}
				setPage={_setPage}
				setSearchQuery={setSearchQuery}
				setSort={setSortType}
				sortOptions={FILE_SORT_OPTIONS}
			/>
			<div className="dashboard-table-container">
				<Table
					columns={[250, 250, 150, 120, 150, 150, 150, 130]}
					keys={["Preview", "Name", "Size", "Visibility", "Views", "Date", "Actions", "Delete"]}
				>
					{auth.files.map((file) => (
						<FileTableContent key={file.name} {...{ file, selectFile, updateFileList }} />
					))}
				</Table>
			</div>
		</CollapseTable>
	);
};

export default FilesList;

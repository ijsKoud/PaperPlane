import "moment-timezone";

import React, { useState } from "react";
import { FC, LINK_SORT_OPTIONS, WebsocketMessageType } from "../../../lib/types";
import Table from "./base/Table";
import UrlTableContent from "./content/UrlTableContent";
import FilterBar from "./base/FilterBar";
import CollapseTable from "./base/CollapseTable";
import { useFormik } from "formik";
import DeleteURLPopup from "./content/DeleteURLPopup";
import { useAuth } from "../../../lib/hooks/useAuth";
import { stringify } from "../../../lib/WebsocketHandler";

const LinksList: FC = () => {
	const [update, setUpdate] = useState(false); // used to trigger useEffect hook
	const [page, setPage] = useState(1);
	const auth = useAuth();

	const formik = useFormik<Record<string, boolean>>({ initialValues: {}, onSubmit: () => void 0 });

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

	const updateURLList = () => setTimeout(() => setUpdate(!update), 1e2);
	const selectUrl = (id: string) => {
		const field = formik.values[id];
		if (field) {
			const values = { ...formik.values };

			delete values[id];
			void formik.setValues(values);
		} else void formik.setFieldValue(id, true);
	};

	return (
		<CollapseTable title="Links">
			<DeleteURLPopup {...{ formik, updateURLList }} />
			<FilterBar
				id="links"
				page={page}
				pages={auth.urlPages}
				setPage={_setPage}
				setSearchQuery={setSearchQuery}
				setSort={setSortType}
				sortOptions={LINK_SORT_OPTIONS}
			/>
			<div className="dashboard-table-container">
				<Table columns={[150, 150, 150, 150, 150, 150, 150]} keys={["Name", "URL", "Visibility", "Visits", "Date", "Actions", "Delete"]}>
					{auth.urls.map((url) => (
						<UrlTableContent key={url.name} {...{ url, selectUrl, updateURLList }} />
					))}
				</Table>
			</div>
		</CollapseTable>
	);
};

export default LinksList;

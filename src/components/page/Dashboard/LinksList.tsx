import "moment-timezone";

import React, { useEffect, useState } from "react";
import { fetch, getCancelToken } from "../../../lib/fetch";
import { ApiURL, FC, URLApiRes, LINK_SORT_OPTIONS } from "../../../lib/types";
import Table from "./base/Table";
import UrlTableContent from "./content/UrlTableContent";
import FilterBar from "./base/FilterBar";
import CollapseTable from "./base/CollapseTable";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import Loader from "../../general/Loader";
import DeleteURLPopup from "./content/DeleteURLPopup";

interface Props {
	protocol: string;
}

const LinksList: FC<Props> = ({ protocol }) => {
	const [urls, setUrls] = useState<ApiURL[]>([]);
	const [update, setUpdate] = useState(false); // used to trigger useEffect hook
	const [loading, setLoading] = useState(false);

	const [page, setPage] = useState(1);
	const [pages, setPages] = useState(1);
	const [searchQuery, setSearchQuery] = useState("");
	const [sort, setSort] = useState("default");

	const formik = useFormik<Record<string, boolean>>({ initialValues: {}, onSubmit: () => void 0 });
	const getURL = (partialUrl: string): string => `${protocol}//${partialUrl}`;

	useEffect(() => {
		const token = getCancelToken();
		const params = new URLSearchParams({ search: searchQuery, sort, page: page.toString() }).toString();

		const updateStates = (data: URLApiRes) => {
			setUrls(data.urls.map((res) => ({ ...res, url: getURL(res.url) })));
			setPages(data.pages);
		};

		fetch<URLApiRes>(`/api/dashboard/urls?${params}`, token.token)
			.then((res) => updateStates(res.data))
			.then(() => setLoading(false))
			.catch(() => toast.error("Unable to load the urls list, please try again later."));

		return () => token.cancel("cancelled");
	}, [page, searchQuery, sort, update]);

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
				pages={pages}
				setPage={setPage}
				setSearchQuery={setSearchQuery}
				setSort={setSort}
				sortOptions={LINK_SORT_OPTIONS}
			/>
			<div className="dashboard-table-container">
				{loading ? (
					<div style={{ display: "grid", placeItems: "center", width: "100%" }}>
						<Loader size={30} />
					</div>
				) : (
					<Table columns={[150, 150, 150, 150, 150, 150, 150]} keys={["Name", "URL", "Visibility", "Visits", "Date", "Actions", "Delete"]}>
						{urls.map((url) => (
							<UrlTableContent key={url.name} {...{ url, selectUrl, updateURLList }} />
						))}
					</Table>
				)}
			</div>
		</CollapseTable>
	);
};

export default LinksList;

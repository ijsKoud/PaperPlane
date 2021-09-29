import axios, { AxiosError, CancelToken } from "axios";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { fetch } from "../../../lib/fetch";
import { alert, success } from "../../../lib/notifications";
import { ApiError, LinkStats, User } from "../../../lib/types";
import Navigation from "./navigation";
import Table from "./Table/table";
import TableContent from "./Table/tableContent";

interface Props {
	user: User;
	fetchStats: () => void;
}

const DashboardLinks: React.FC<Props> = ({ user, fetchStats }) => {
	const [page, setPage] = useState(1);
	const [pages, setPages] = useState(1);

	const [sort, setSort] = useState("default");
	const [query, setQuery] = useState("");

	const [links, setLinks] = useState<LinkStats[]>([]);

	const fetchLinks = (token?: CancelToken | undefined) => {
		const path = `/stats/links?page=${page}&sortType=${sort}&search=${encodeURIComponent(
			query ?? ""
		)}`;
		fetch<{ pages: LinkStats[]; length: number }>(path, {
			withCredentials: true,
			cancelToken: token,
		})
			.then((res) => {
				setPages(res.data.length);
				setLinks(
					res.data.pages.map((file) => ({
						...file,
						date: `${moment(file.date).format("DD/MM/YYYY HH:mm:ss")}`,
					}))
				);
			})
			.catch(() => void 0);
	};

	useEffect(() => {
		const { token, cancel } = axios.CancelToken.source();
		fetchLinks(token);

		return () => cancel("Cancelled");
	}, [page, sort]);

	const getLink = (id: string) => `/${user?.userId}/r/${id}`;

	const deleteLink = async (path: string) => {
		setLinks(links.filter((link) => link.path !== path));

		try {
			await fetch(`/${user.userId}/r/${path}`, { method: "DELETE" });
			success("Link deleted!", `Successfully deleted link: ${path}`);
		} catch (error) {
			if (!("isAxiosError" in error)) return;

			const err = error as AxiosError<ApiError>;
			alert("Could not delete the link", `${err.response?.data.message ?? "Unknown cause"}`);
		}

		fetchLinks();
		fetchStats();
	};

	return (
		<div className="dashboard-stats file">
			<h1 className="dashboard__stats-title files">Links</h1>
			<Navigation {...{ setQuery, setPage, setSort, fetchItems: fetchLinks, page, pages }} />
			<Table listItems={["Code", "URL", "Date", "Actions"]}>
				{links.map((link, i) => {
					const shortLink = `${location.protocol}//${location.host}${getLink(link.path)}`;

					const props = {
						...link,
						type: "link" as const,
						key: i,
						shortLink,
						deleteLink,
						fetchLinks,
					};
					return <TableContent {...props} />;
				})}
			</Table>
		</div>
	);
};

export default DashboardLinks;

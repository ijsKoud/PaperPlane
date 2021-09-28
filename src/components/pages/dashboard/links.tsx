import Tippy from "@tippyjs/react";
import axios, { AxiosError, CancelToken } from "axios";
import copy from "copy-to-clipboard";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { sortTypes } from "../../../lib/constants";
import { fetch } from "../../../lib/fetch";
import { alert, success } from "../../../lib/notifications";
import { ApiError, LinkStats, User } from "../../../lib/types";
import ReactSelectDropdown from "../../reactSelectDropdown";

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
	const copyLink = (link: string) => copy(`${location.protocol}//${location.host}${getLink(link)}`);

	const deleteLink = async (path: string, name: string) => {
		setLinks(links.filter((link) => link.path !== path));

		try {
			await fetch(`/${user.userId}/r/${path}`, { method: "DELETE" });
			success("Link deleted!", `Successfully deleted link: ${name}`);
		} catch (error) {
			if (!("isAxiosError" in error)) return;

			const err = error as AxiosError<ApiError>;
			alert("Could not delete the link", `${err.response?.data.message ?? "Unknown cause"}`);
		}

		fetchLinks();
		fetchStats();
	};

	const onSortChange = (value: { label: string; value: any } | null) => {
		if (!value) return;
		setSort(value.value);
	};

	const nextPage = () => {
		const next = page + 1;
		if (pages < next) return;

		setPage(next);
	};

	const previousPage = () => {
		const previous = page - 1;
		if (0 >= previous) return;

		setPage(previous);
	};

	const search = () => {
		setPage(1);
		fetchLinks();
	};

	return (
		<div className="dashboard-stats file">
			<h1 className="dashboard__stats-title files">Links</h1>
			<div className="dashboard__stats-navigation">
				<div className="dashboard__files-search">
					<input
						type="search"
						placeholder="Search..."
						onChange={(e) => setQuery(e.target.value.trim())}
					/>
					<i className="fas fa-search" onClick={search} />
				</div>
				<div className="dashboard__page-selection">
					<p
						onClick={previousPage}
						className={
							0 >= page - 1 ? "dashboard__page-button disabled" : "dashboard__page-button"
						}>
						<i className="fas fa-angle-left" /> Previous
					</p>
					<ReactSelectDropdown
						instanceId="page"
						// @ts-ignore
						onChange={(v: { label: string; value: any }) => setPage(v.value)}
						options={Array(pages)
							.fill(null)
							.map((_, i) => ({ label: `Page ${i + 1}`, value: i + 1 }))}
						className="dashboard__page-dropdown"
						value={{ label: `Page ${page}`, value: page }}
					/>
					<p
						onClick={nextPage}
						className={
							pages < page + 1 ? "dashboard__page-button disabled" : "dashboard__page-button"
						}>
						Next <i className="fas fa-angle-right" />
					</p>
				</div>
				<ReactSelectDropdown
					instanceId="sort-type"
					// @ts-ignore
					onChange={onSortChange}
					options={sortTypes}
					defaultValue={sortTypes[0]}
					className="dashboard__page-dropdown2"
				/>
			</div>
			<div className="dashboard__files-table">
				<table>
					<thead>
						<tr>
							<th>Name</th>
							<th>Code</th>
							<th>URL</th>
							<th>Date</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{links.map((link, i) => (
							<tr key={i}>
								<td>{link.name}</td>
								<td>{link.path}</td>
								<td>{link.url}</td>
								<td>{link.date}</td>
								<td>
									<div className="dashboard__table-buttons">
										<Tippy duration={5e2} content={<p>Open in browser</p>}>
											<i
												className="open fas fa-external-link-alt"
												onClick={() => window.open(getLink(link.path))}
											/>
										</Tippy>
										<Tippy duration={5e2} content={<p>Copy the link</p>}>
											<i className="copy fas fa-link" onClick={() => copyLink(link.path)} />
										</Tippy>
										<Tippy duration={5e2} content={<p>Edit the link</p>}>
											<i className="edit fas fa-edit" />
										</Tippy>
										<Tippy duration={5e2} content={<p>Delete the link</p>}>
											<i
												className="delete fas fa-trash"
												onClick={() => deleteLink(link.path, link.name)}
											/>
										</Tippy>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default DashboardLinks;

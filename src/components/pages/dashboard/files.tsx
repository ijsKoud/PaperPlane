import Tippy from "@tippyjs/react";
import axios, { AxiosError, CancelToken } from "axios";
import copy from "copy-to-clipboard";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { sortTypes } from "../../../lib/constants";
import { fetch } from "../../../lib/fetch";
import { alert, success } from "../../../lib/notifications";
import { ApiError, FileStats, User } from "../../../lib/types";
import ReactSelectDropdown from "../../reactSelectDropdown";

interface Props {
	user: User;
	fetchStats: () => void;
}

const DashboardFiles: React.FC<Props> = ({ user, fetchStats }) => {
	const [page, setPage] = useState(1);
	const [pages, setPages] = useState(1);

	const [sort, setSort] = useState("default");
	const [query, setQuery] = useState("");

	const [files, setFiles] = useState<FileStats[]>([]);

	const fetchFiles = (token?: CancelToken | undefined) => {
		const path = `/stats/files?page=${page}&sortType=${sort}&search=${encodeURIComponent(
			query ?? ""
		)}`;
		fetch<{ pages: FileStats[]; length: number }>(path, {
			withCredentials: true,
			cancelToken: token,
		})
			.then((res) => {
				setPages(res.data.length);
				setFiles(
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
		fetchFiles(token);

		return () => cancel("Cancelled");
	}, [page, sort]);

	const getFileLink = (id: string, api = true) =>
		`${api ? process.env.NEXT_PUBLIC_API : `${location.protocol}//${location.host}`}/${
			user?.userId
		}/${id}`;
	const copyLink = (file: string) => copy(getFileLink(file, false));

	const downloadFile = (url: string, name: string) => saveAs(url, name);

	const deleteFile = async (name: string) => {
		setFiles(files.filter((file) => file.name !== name));

		try {
			await fetch(`/${user.userId}/${name}`, { method: "DELETE" });
			success("File deleted!", `Successfully deleted file: ${name}`);
		} catch (error) {
			if (!("isAxiosError" in error)) return;

			const err = error as AxiosError<ApiError>;
			alert("Could not delete the file", `${err.response?.data.message ?? "Unknown cause"}`);
		}

		fetchFiles();
		fetchStats();
	};

	const onSortChange = (value: { label: string; value: any } | null) => {
		if (!value) return;
		setSort(value.value);
	};

	const getPreview = (type: string, url: string) => {
		type = type.split("/")[0];
		switch (type) {
			case "image":
				return <img alt="" className="dashboard__table-preview" src={url} />;
			case "video":
				return <video className="dashboard__table-preview" controls src={url} />;
			default:
				return <i className="fas fa-file no-preview dashboard__table-preview" />;
		}
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
		fetchFiles();
	};

	return (
		<div className="dashboard-stats file">
			<h1 className="dashboard__stats-title files">Files</h1>
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
							<th>Preview</th>
							<th>Name</th>
							<th>Size</th>
							<th>Date</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{files.map((file, i) => (
							<tr key={i}>
								<td>{getPreview(file.type, getFileLink(file.name))}</td>
								<td>{file.name}</td>
								<td>{file.size}</td>
								<td>{file.date}</td>
								<td>
									<div className="dashboard__table-buttons">
										<Tippy duration={5e2} content={<p>Open in browser</p>}>
											<i
												className="open fas fa-external-link-alt"
												onClick={() => window.open(getFileLink(file.name, false))}
											/>
										</Tippy>
										<Tippy duration={5e2} content={<p>Download the file</p>}>
											<i
												className="download fas fa-cloud-download-alt"
												onClick={() => downloadFile(getFileLink(file.name, true), file.name)}
											/>
										</Tippy>
										<Tippy duration={5e2} content={<p>Copy the link</p>}>
											<i className="copy fas fa-link" onClick={() => copyLink(file.name)} />
										</Tippy>
										<Tippy duration={5e2} content={<p>Edit the file name</p>}>
											<i className="edit fas fa-edit" />
										</Tippy>
										<Tippy duration={5e2} content={<p>Delete the file</p>}>
											<i className="delete fas fa-trash" onClick={() => deleteFile(file.name)} />
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

export default DashboardFiles;

import axios, { AxiosError, CancelToken } from "axios";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { fetch } from "../../../lib/fetch";
import { alert, success } from "../../../lib/notifications";
import { ApiError, FileStats, User } from "../../../lib/types";
import Navigation from "./navigation";
import Table from "./Table/table";
import TableContent from "./Table/tableContent";

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

	return (
		<>
			<div className="dashboard-stats file">
				<h1 className="dashboard__stats-title files">Files</h1>
				<Navigation {...{ setQuery, setPage, setSort, fetchFiles, page, pages }} />
				<Table listItems={["Preview", "Name", "Size", "Date", "Actions"]}>
					{files.map((file, i) => {
						const fileLink = getFileLink(file.name, false);
						const apiFileLink = getFileLink(file.name);
						const preview = getPreview(file.type, apiFileLink);

						const props = {
							...file,
							type: "file" as "file" | "link",
							key: i,
							fileLink,
							apiFileLink,
							preview,
							deleteFile,
						};
						return <TableContent {...props} />;
					})}
				</Table>
			</div>
		</>
	);
};

export default DashboardFiles;

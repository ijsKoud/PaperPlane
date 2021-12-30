import React, { useEffect, useState } from "react";
import { motion, useAnimation, Variants } from "framer-motion";
import { defaultVariant } from "../../lib/clientConstants";
import Navigation from "./table/Navigation";
import { ApiError, fetch, FileStats, getCancelToken } from "../../lib";
import type { AxiosError, CancelToken } from "axios";
import Image from "next/image";
import moment from "moment";
import { alert, success } from "../../lib/notifications";
import TableContent from "./table/TableContent";
import Table from "./table/Table";

const carrotButtonVariants: Variants = {
	init: {
		transform: "rotate(0deg)",
		...defaultVariant
	},
	animation: {
		transform: "rotate(90deg)",
		...defaultVariant
	}
};

const tableVariants: Variants = {
	init: {
		maxHeight: 0,
		...defaultVariant
	},
	animation: {
		maxHeight: 2100,
		...defaultVariant
	}
};

interface Props {
	fetchStats: (token?: CancelToken) => void;
}

const Statistics: React.FC<Props> = ({ fetchStats }) => {
	const [open, setOpen] = useState(true);
	const controller = useAnimation();

	const [page, setPage] = useState(1);
	const [pages, setPages] = useState(1);

	const [sort, setSort] = useState("default");
	const [query, setQuery] = useState("");

	const [files, setFiles] = useState<FileStats[]>([]);

	const fetchFiles = (token?: CancelToken | undefined) => {
		const path = `/api/files/search?page=${page}&sortType=${sort}&search=${encodeURIComponent(query ?? "")}`;
		fetch<{ pages: FileStats[]; length: number }>(path, token)
			.then((res) => {
				setPages(res.data.length);
				setFiles(
					res.data.pages.map((file) => ({
						...file,
						date: `${moment(file.date).format("DD/MM/YYYY HH:mm:ss")}`
					}))
				);
			})
			.catch(() => void 0);
	};

	useEffect(() => {
		const { token, cancel } = getCancelToken();

		fetchFiles(token);
		void controller.start("animation");

		return () => {
			cancel("Cancelled");
			controller.stop();
		};
	}, [page, sort]);

	const getFileLink = (id: string, full = false) => `${full ? process.env.NEXT_PUBLIC_DOMAIN : ""}/files/${id}${full ? "?raw=true" : ""}`;

	const deleteFile = async (name: string) => {
		setFiles(files.filter((file) => file.name !== name));

		try {
			await fetch("/api/files", undefined, { method: "DELETE", data: { name } });
			success("File deleted!", `Successfully deleted file: ${name}`);
		} catch (error) {
			if (!error || typeof error !== "object" || !("isAxiosError" in error)) return;

			const err = error as AxiosError<ApiError>;
			alert("Could not delete the file", `${err.response?.data.message ?? "Unknown cause"}`);
		}

		fetchFiles();
		fetchStats();
	};

	const getPreview = (_type: string, url: string) => {
		const [type] = _type.split("/");
		switch (type) {
			case "image":
				return <Image alt="" className="dashboard__table-preview" src={url} width={100} height={50} />;
			case "video":
				return <video className="dashboard__table-preview" controls src={url} style={{ maxWidth: 100, maxHeight: 50 }} />;
			default:
				return <i className="fas fa-file no-preview dashboard__table-preview" />;
		}
	};

	const toggleOpen = () => {
		const _open = !open;
		setOpen(_open);

		controller.stop();
		if (_open) void controller.start("animation");
		else void controller.start("init");
	};

	return (
		<div className="dashboard-table">
			<div className="dashboard-table-title">
				<motion.button onClick={toggleOpen} variants={carrotButtonVariants} initial="init" animate={controller}>
					<i className="fas fa-chevron-right" />
				</motion.button>
				<h1>Files</h1>
			</div>
			<motion.div className="dashboard-table-items" variants={tableVariants} initial="init" animate={controller}>
				<Navigation {...{ setQuery, setPage, setSort, fetchItems: fetchFiles, page, pages }} />
				<Table listItems={["Preview", "Name", "Size", "Date", "Actions"]}>
					{files.map((file, i) => {
						const fileLink = getFileLink(file.name);
						const apiFileLink = getFileLink(file.name, true);
						const preview = getPreview(file.type, apiFileLink);

						const props = {
							...file,
							type: "file" as const,
							fileLink,
							apiFileLink,
							preview,
							deleteFile,
							fetchFiles
						};
						return <TableContent key={i} {...props} />;
					})}
				</Table>
			</motion.div>
		</div>
	);
};

export default Statistics;

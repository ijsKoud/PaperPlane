import type { AxiosError, CancelToken } from "axios";
import { motion, useAnimation, Variants } from "framer-motion";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { ApiError, fetch, getCancelToken, LinkStats } from "../../lib";
import { defaultVariant } from "../../lib/clientConstants";
import { alert, success } from "../../lib/notifications";
import Navigation from "./table/Navigation";
import Table from "./table/Table";
import TableContent from "./table/TableContent";

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
		maxHeight: 2500,
		...defaultVariant
	}
};

interface Props {
	fetchStats: () => void;
}

const LinkTable: React.FC<Props> = ({ fetchStats }) => {
	const [open, setOpen] = useState(true);
	const controller = useAnimation();

	const [page, setPage] = useState(1);
	const [pages, setPages] = useState(1);

	const [sort, setSort] = useState("default");
	const [query, setQuery] = useState("");

	const [links, setLinks] = useState<LinkStats[]>([]);

	const fetchLinks = (token?: CancelToken | undefined) => {
		const path = `/api/links/search?page=${page}&sortType=${sort}&search=${encodeURIComponent(query ?? "")}`;
		fetch<{ pages: LinkStats[]; length: number }>(path, token)
			.then((res) => {
				setPages(res.data.length);
				setLinks(
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

		fetchLinks(token);
		void controller.start("animation");

		return () => {
			cancel("Cancelled");
			controller.stop();
		};
	}, [page, sort]);

	const getLink = (id: string) => `/r/${id}`;

	const deleteLink = async (path: string) => {
		setLinks(links.filter((link) => link.id !== path));

		try {
			await fetch("/api/links", undefined, { method: "DELETE", data: { path } });
			success("Link deleted!", `Successfully deleted link: ${path}`);
		} catch (error) {
			if (!error || typeof error !== "object" || !("isAxiosError" in error)) return;

			const err = error as AxiosError<ApiError>;
			alert("Could not delete the link", `${err.response?.data.message ?? "Unknown cause"}`);
		}

		fetchLinks();
		fetchStats();
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
				<h1>Links</h1>
			</div>
			<motion.div className="dashboard-table-items" variants={tableVariants} initial="init" animate={controller}>
				<Navigation {...{ setQuery, setPage, setSort, fetchItems: fetchLinks, page, pages }} />
				<Table listItems={["Code", "URL", "Date", "Actions"]}>
					{links.map((link, i) => {
						const shortLink = `${process.env.NEXT_PUBLIC_DOMAIN}${getLink(link.id)}`;

						const props = {
							...link,
							type: "link" as const,
							shortLink,
							deleteLink,
							fetchLinks
						};
						return <TableContent key={i} {...props} />;
					})}
				</Table>
			</motion.div>
		</div>
	);
};

export default LinkTable;

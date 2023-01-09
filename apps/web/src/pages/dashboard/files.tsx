import type { NextPage } from "next";
import { DashboardDeleteBanner, DashboardLayout, DashboardToolbar, FilesGrid } from "@paperplane/ui";
import { TertiaryButton } from "@paperplane/buttons";
import { useSwrWithUpdates } from "@paperplane/swr";
import { useState } from "react";
import { FilesApiRes, Sort } from "@paperplane/utils";

const FilesDashboard: NextPage = () => {
	const [page, setPage] = useState(0);
	const [search, setSearch] = useState("");
	const [view, setView] = useState<"grid" | "list">("grid");
	const [sort, setSort] = useState<Sort>(Sort.DATE_NEW_OLD);

	const [selected, setSelected] = useState<string[]>([]);
	const onSelect = (fileName: string) => {
		if (selected.includes(fileName)) setSelected(selected.filter((str) => str !== fileName));
		else setSelected([...selected, fileName]);
	};

	const swr = useSwrWithUpdates<FilesApiRes>(`/api/files?page=${page}&search=${encodeURIComponent(search)}&sort=${sort}`);
	if (!swr.data || swr.error) return <div></div>;

	return (
		<DashboardLayout className="max-w-[1008px]">
			<div className="w-full flex justify-between items-center">
				<h1 className="text-4xl">Files</h1>
				<TertiaryButton type="button">Upload</TertiaryButton>
			</div>
			<DashboardToolbar
				sort={sort}
				setSort={setSort}
				pages={swr.data?.pages ?? 0}
				page={page}
				setPage={setPage}
				setSearch={setSearch}
				view={view}
				setView={setView}
			/>
			{view === "grid" ? <FilesGrid onSelect={onSelect} selected={selected} files={swr.data?.files} /> : <></>}
			<DashboardDeleteBanner items={selected} type="file" />
		</DashboardLayout>
	);
};

export default FilesDashboard;

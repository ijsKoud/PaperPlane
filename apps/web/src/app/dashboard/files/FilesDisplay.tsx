"use client";

import { Input } from "@paperplane/ui/input";
import { FilesSortNames, FilesSort } from "@paperplane/utils";
import React, { useEffect, useState } from "react";
import { CreateDialog } from "./CreateDialog";
import { DataTable } from "./_table/data-table";
import { columns } from "./_table/columns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@paperplane/ui/select";
import { Button } from "@paperplane/ui/button";
import { LayoutPanelTopIcon, Table2Icon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@paperplane/ui/tooltip";
import { GridView } from "./_grid/GridView";
import { PaperPlaneApiOutputs, api } from "#trpc/server";

type ShortUrl = PaperPlaneApiOutputs["v1"]["dashboard"]["files"]["list"];

const UseFilesList = () => {
	const [data, setData] = useState<ShortUrl>({ entries: [], pages: 0 });
	const [sort, setSort] = useState<FilesSort>(FilesSort.DATE_NEW_OLD);
	const [page, setPage] = useState(0);
	const [search, setSearch] = useState("");

	useEffect(() => {
		const updateList = () => api().v1.dashboard.files.list.query({ page, query: search, sort });
		void updateList().then(setData);

		const interval = setInterval(() => void updateList().then(setData), 5e3);
		return () => clearInterval(interval);
	}, [search, page, sort]);

	return { ...data, page, setPage, search, setSearch, sort, setSort };
};

export const FilesDisplay: React.FC = () => {
	const data = UseFilesList();
	const [display, setDisplay] = useState<"grid" | "list">("grid");

	return (
		<div className="w-full">
			<div className="flex items-center justify-between mb-2 max-sm:flex-col gap-y-2">
				<div className="flex items-center gap-2 max-sm:flex-col">
					<Input
						className="w-fit"
						value={data.search}
						onChange={(ctx) => data.setSearch(ctx.currentTarget.value)}
						placeholder="Search for a file..."
					/>

					<Select value={data.sort.toString()} onValueChange={(value) => data.setSort(Number(value))}>
						<SelectTrigger className="min-w-[148px]">
							<SelectValue placeholder="Select a sorting method" />
						</SelectTrigger>
						<SelectContent>
							{Object.keys(FilesSortNames).map((sort, key) => (
								<SelectItem key={key} value={sort}>
									{FilesSortNames[sort as unknown as keyof typeof FilesSortNames]}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<div className="flex items-center gap-1 ml-2">
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button onClick={() => setDisplay("grid")} variant="outline" className="px-2">
										<LayoutPanelTopIcon />
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p>Grid layout</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>

						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button onClick={() => setDisplay("list")} variant="outline" className="px-2">
										<Table2Icon />
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<p>Table layout</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</div>
				</div>
				<CreateDialog />
			</div>

			{display === "list" && <DataTable columns={columns} data={data.entries} page={data.page} pages={data.pages} setPage={data.setPage} />}
			{display === "grid" && <GridView files={data.entries} page={data.page} pages={data.pages} setPage={data.setPage} />}
		</div>
	);
};

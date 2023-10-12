"use client";

import { Input } from "@paperplane/ui/input";
import { BinSortNames, BinSort } from "@paperplane/utils";
import React, { useEffect, useState } from "react";
import { CreateDialog } from "./CreateDialog";
import { DataTable } from "./_table/data-table";
import { columns } from "./_table/columns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@paperplane/ui/select";
import { PaperPlaneApiOutputs, api } from "#trpc/server";

type PastebinData = PaperPlaneApiOutputs["v1"]["dashboard"]["bins"]["list"];
export type Pastebin = PastebinData["entries"][0];

const UsePastebinList = () => {
	const [data, setData] = useState<PastebinData>({ entries: [], pages: 0 });
	const [sort, setSort] = useState<BinSort>(BinSort.DATE_NEW_OLD);
	const [page, setPage] = useState(0);
	const [search, setSearch] = useState("");

	useEffect(() => {
		const updateList = () => api().v1.dashboard.bins.list.query({ page, query: search, sort });
		void updateList().then(setData);

		const interval = setInterval(() => void updateList().then(setData), 5e3);
		return () => clearInterval(interval);
	}, [search, page, sort]);

	return { ...data, page, setPage, search, setSearch, sort, setSort };
};

export const PastebinTable: React.FC = () => {
	const data = UsePastebinList();

	return (
		<div className="w-full">
			<div className="flex items-center justify-between mb-2 max-sm:flex-col gap-y-2">
				<div className="flex items-center gap-2 max-sm:flex-col">
					<Input
						className="w-fit"
						value={data.search}
						onChange={(ctx) => data.setSearch(ctx.currentTarget.value)}
						placeholder="Search for a pastebin..."
					/>

					<Select value={data.sort.toString()} onValueChange={(value) => data.setSort(Number(value))}>
						<SelectTrigger className="min-w-[148px]">
							<SelectValue placeholder="Select a sorting method" />
						</SelectTrigger>
						<SelectContent>
							{Object.keys(BinSortNames).map((sort, key) => (
								<SelectItem key={key} value={sort}>
									{BinSortNames[sort as unknown as keyof typeof BinSortNames]}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<CreateDialog />
			</div>

			<DataTable columns={columns} data={data.entries} page={data.page} pages={data.pages} setPage={data.setPage} />
		</div>
	);
};

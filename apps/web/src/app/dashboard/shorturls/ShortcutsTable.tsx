"use client";

import { Input } from "@paperplane/ui/input";
import { ShortUrlsSortNames, UrlsSort } from "@paperplane/utils";
import React, { useEffect, useState } from "react";
import { CreateDialog } from "./CreateDialog";
import { DataTable } from "./_table/data-table";
import { columns } from "./_table/columns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@paperplane/ui/select";
import { type PaperPlaneApiOutputs, api } from "#trpc/server";

type ShortUrlData = PaperPlaneApiOutputs["v1"]["dashboard"]["url"]["list"];
export type ShortUrl = ShortUrlData["entries"][0];

const UseShortcutsList = () => {
	const [data, setData] = useState<ShortUrlData>({ entries: [], pages: 0 });
	const [sort, setSort] = useState<UrlsSort>(UrlsSort.DATE_NEW_OLD);
	const [page, setPage] = useState(0);
	const [search, setSearch] = useState("");

	useEffect(() => {
		const updateList = () => api().v1.dashboard.url.list.query({ page, query: search, sort });
		void updateList().then(setData);

		const interval = setInterval(() => void updateList().then(setData), 5e3);
		return () => clearInterval(interval);
	}, [search, page, sort]);

	return { ...data, page, setPage, search, setSearch, sort, setSort };
};

export const ShortcutsTable: React.FC = () => {
	const data = UseShortcutsList();

	return (
		<div className="w-full">
			<div className="flex items-center justify-between mb-2 max-sm:flex-col gap-y-2">
				<div className="flex items-center gap-2 max-sm:flex-col">
					<Input
						className="w-fit"
						value={data.search}
						onChange={(ctx) => data.setSearch(ctx.currentTarget.value)}
						placeholder="Search for a shorturl..."
					/>

					<Select value={data.sort.toString()} onValueChange={(value) => data.setSort(Number(value))}>
						<SelectTrigger className="min-w-[148px]">
							<SelectValue placeholder="Select a sorting method" />
						</SelectTrigger>
						<SelectContent>
							{Object.keys(ShortUrlsSortNames).map((sort, key) => (
								<SelectItem key={key} value={sort}>
									{ShortUrlsSortNames[sort as unknown as keyof typeof ShortUrlsSortNames]}
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

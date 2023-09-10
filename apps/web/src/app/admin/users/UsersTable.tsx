"use client";

import { useSwrWithUpdates } from "@paperplane/swr";
import { Input } from "@paperplane/ui/input";
import { UsersApi, AdminUserSort, AdminUserSortNames } from "@paperplane/utils";
import React, { useEffect, useState } from "react";
import { CreateDialog } from "./CreateDialog";
import { DataTable } from "./_table/data-table";
import { columns } from "./_table/columns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@paperplane/ui/select";

const UseUsersList = () => {
	const [data, setData] = useState<UsersApi>({ entries: [], pages: 0 });
	const [sort, setSort] = useState<AdminUserSort>(AdminUserSort.DATE_NEW_OLD);
	const [page, setPage] = useState(0);
	const [search, setSearch] = useState("");

	const swr = useSwrWithUpdates<UsersApi>(`/api/admin/users?page=${page}&search=${encodeURIComponent(search)}&sort=${sort}`);
	useEffect(() => {
		if (swr.data) setData(swr.data);
	}, [swr.data]);

	return { ...data, page, setPage, search, setSearch, sort, setSort };
};

export const UsersTable: React.FC = () => {
	const data = UseUsersList();

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
							{Object.keys(AdminUserSortNames).map((sort, key) => (
								<SelectItem key={key} value={sort}>
									{AdminUserSortNames[sort as unknown as keyof typeof AdminUserSortNames]}
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

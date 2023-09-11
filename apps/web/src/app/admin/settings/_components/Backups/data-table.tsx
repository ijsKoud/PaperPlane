"use client";

import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@paperplane/ui/table";
import React from "react";
import { Button } from "@paperplane/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@paperplane/ui/select";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	pages: number;
	page: number;
	setPage: React.Dispatch<React.SetStateAction<number>>;
}

export const DataTable = <TData, TValue>({ columns, data, page, pages, setPage }: DataTableProps<TData, TValue>) => {
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel()
	});

	const nextPage = () => {
		if (page + 1 >= pages) return;
		setPage(page + 1);
	};

	const previousPage = () => {
		if (page <= 0) return;
		setPage(page - 1);
	};

	return (
		<React.Fragment>
			<div className="rounded-md border dark:border-zinc-800">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow className="dark:border-zinc-800" key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id}>
										{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow className="dark:border-zinc-800" key={row.id} data-state={row.getIsSelected() && "selected"}>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={columns.length} className="h-24 text-center">
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			<div className="flex items-center justify-between max-sm:flex-col mb-8">
				<div className="flex items-center mt-2 gap-2">
					<Button variant="outline" onClick={previousPage} disabled={page <= 0}>
						Previous
					</Button>
					<Select value={(page + 1).toString()} onValueChange={(value) => setPage(Number(value))}>
						<SelectTrigger className="min-w-[96px]">
							<SelectValue placeholder="Select a domain" />
						</SelectTrigger>
						<SelectContent>
							{Array(pages)
								.fill(null)
								.map((_, page) => (
									<SelectItem key={page} value={(page + 1).toString()}>
										Page {page + 1}
									</SelectItem>
								))}
						</SelectContent>
					</Select>
					<Button variant="outline" onClick={nextPage} disabled={page + 1 >= pages}>
						Next
					</Button>
				</div>
			</div>
		</React.Fragment>
	);
};

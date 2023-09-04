"use client";

import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@paperplane/ui/table";
import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import { useToast } from "@paperplane/ui/use-toast";
import { ToastAction } from "@paperplane/ui/toast";
import { Button } from "@paperplane/ui/button";
import { Trash2Icon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@paperplane/ui/select";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	pages: number;
	page: number;
	setPage: React.Dispatch<React.SetStateAction<number>>;
}

export const DataTable = <TData, TValue>({ columns, data, page, pages, setPage }: DataTableProps<TData, TValue>) => {
	const { toast } = useToast();
	const [rowSelection, setRowSelection] = useState({});
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		onRowSelectionChange: setRowSelection,
		state: {
			rowSelection
		}
	});

	async function deleteBins() {
		try {
			const bins = table.getFilteredSelectedRowModel().rows;
			await axios.delete("/api/dashboard/paste-bins/bulk", { data: { bins: bins.map((bin) => bin.getValue("name")) } });
			toast({ title: "Pastebins Deleted", description: `${bins.length} urls have been deleted.` });
			setRowSelection({});
		} catch (err) {
			const _error = "isAxiosError" in err ? (err as AxiosError<{ message: string }>).response?.data.message : "";
			const error = _error || "n/a";

			toast({
				variant: "destructive",
				title: "Uh oh! Something went wrong",
				description: `There was a problem with your request: ${error}`,
				action: (
					<ToastAction altText="Try again" onClick={deleteBins}>
						Try again
					</ToastAction>
				)
			});
		}
	}

	const nextPage = () => {
		if (page + 1 >= pages) return;
		setPage(page + 1);
		setRowSelection({});
	};

	const previousPage = () => {
		if (page <= 0) return;
		setPage(page - 1);
		setRowSelection({});
	};

	return (
		<React.Fragment>
			<div className="rounded-md border dark:border-zinc-800 overflow-x-auto max-w-[calc(100vw-16px)]">
				<Table className="w-full min-w-[750px]">
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

			<div className="flex items-center justify-between max-sm:flex-col">
				<Button className="mt-2" variant="destructive" onClick={deleteBins} disabled={table.getFilteredSelectedRowModel().rows.length <= 0}>
					<Trash2Icon className="mr-2 w-4 h-4" /> Delete {table.getFilteredSelectedRowModel().rows.length} pastebins
				</Button>

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

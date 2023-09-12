"use client";

import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@paperplane/ui/table";
import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import { useToast } from "@paperplane/ui/use-toast";
import { ToastAction } from "@paperplane/ui/toast";
import { Button } from "@paperplane/ui/button";
import { Trash2Icon } from "lucide-react";
import { generateToken } from "@paperplane/utils";
import { saveAs } from "file-saver";
import CreateDialog from "./CreateDialog";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
}

export const DataTable = <TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) => {
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

	async function deleteTokens() {
		try {
			const tokens = table.getFilteredSelectedRowModel().rows;
			await axios.delete("/api/dashboard/tokens", { data: { tokens: tokens.map((token) => token.getValue("name")) } });
			toast({ title: "Tokens Deleted", description: `${tokens.length} tokens have been deleted.` });
			setRowSelection({});
		} catch (err) {
			const _error = "isAxiosError" in err ? (err as AxiosError<{ message: string }>).response?.data.message : "";
			const error = _error || "n/a";

			toast({
				variant: "destructive",
				title: "Uh oh! Something went wrong",
				description: `There was a problem with your request: ${error}`,
				action: (
					<ToastAction altText="Try again" onClick={deleteTokens}>
						Try again
					</ToastAction>
				)
			});
		}
	}

	const generateApiToken = async (name: string) => {
		try {
			const res = await axios.post<string>("/api/dashboard/tokens", { name });
			return res.data;
		} catch (err) {
			const _error = "isAxiosError" in err ? (err as AxiosError<{ message: string }>).response?.data.message : "";
			const error = _error || "n/a";

			toast({
				variant: "destructive",
				title: "Uh oh! Something went wrong",
				description: `There was a problem with your request: ${error}`,
				action: (
					<ToastAction altText="Try again" onClick={generateSharexConfig}>
						Try again
					</ToastAction>
				)
			});

			throw new Error();
		}
	};

	async function generateSharexConfig() {
		try {
			const token = await generateApiToken(`ShareX-token-${generateToken(12)}`);
			const config = {
				Name: "PaperPlane",
				DestinationType: "ImageUploader, TextUploader, FileUploader",
				RequestMethod: "POST",
				RequestURL: `${location.protocol}//${location.host}/api/v1/upload`,
				Headers: {
					Authorization: token
				},
				URL: "$json:url$",
				Body: "MultipartFormData",
				FileFormName: "file"
			};

			const blob = new Blob([JSON.stringify(config)], {
				type: "data:application/json;charset=utf-8"
			});
			saveAs(blob, "PaperPlane-config.sxcu");
		} catch (error) {}
	}

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

			<div className="flex items-center justify-between max-sm:flex-col gap-y-2 mt-2">
				<Button variant="destructive" onClick={deleteTokens} disabled={table.getFilteredSelectedRowModel().rows.length <= 0}>
					<Trash2Icon className="mr-2 w-4 h-4" /> Delete {table.getFilteredSelectedRowModel().rows.length} tokens
				</Button>

				<div className="flex items-center gap-2 max-sm:flex-col">
					<CreateDialog createApiToken={generateApiToken} />
					<Button onClick={generateSharexConfig}>Generate ShareX config</Button>
				</div>
			</div>
		</React.Fragment>
	);
};

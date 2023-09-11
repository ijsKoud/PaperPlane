/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { Button } from "@paperplane/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from "@paperplane/ui/dropdown-menu";
import { Checkbox } from "@paperplane/ui/checkbox";
import { SignUpDomain, formatDate } from "@paperplane/utils";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontalIcon } from "lucide-react";
import axios, { AxiosError } from "axios";
import { useToast } from "@paperplane/ui/use-toast";
import { ToastAction } from "@paperplane/ui/toast";

export const columns: ColumnDef<SignUpDomain>[] = [
	{
		id: "select",
		header: ({ table }) => (
			<Checkbox
				checked={table.getIsAllPageRowsSelected()}
				onCheckedChange={(value) => table.toggleAllPageRowsSelected(Boolean(value))}
				aria-label="Select all"
			/>
		),
		cell: ({ row }) => (
			<Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(Boolean(value))} aria-label="Select row" />
		),
		enableSorting: false,
		enableHiding: false
	},
	{
		accessorKey: "domain",
		header: "Domain"
	},
	{
		accessorKey: "date",
		header: "Created At",
		cell: ({ row }) => {
			const date = row.getValue("date") as Date;
			return <span>{formatDate(date)}</span>;
		}
	},
	{
		id: "actions",
		cell: ({ row, table }) => {
			const { toast } = useToast();
			const domain = table.options.data.find((dm) => dm.domain === (row.getValue("domain") as string));
			if (!domain) throw new Error("[USERS TABLE]: EXPECTED DOMAIN OBJECT BUT RECEIVED UNDEFINED");

			async function deleteDomain() {
				try {
					await axios.delete("/api/admin/domains", { data: { domains: [domain!.domain] } });
					toast({ title: "Domain Deleted", description: `${domain!.domain} has been deleted.` });
				} catch (err) {
					const _error = "isAxiosError" in err ? (err as AxiosError<{ message: string }>).response?.data.message : "";
					const error = _error || "n/a";

					toast({
						variant: "destructive",
						title: "Uh oh! Something went wrong",
						description: `There was a problem with your request: ${error}`,
						action: (
							<ToastAction altText="Try again" onClick={deleteDomain}>
								Try again
							</ToastAction>
						)
					});
				}
			}

			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" className="h-8 w-8 p-0">
							<span className="sr-only">Open menu</span>
							<MoreHorizontalIcon className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel>Actions</DropdownMenuLabel>

						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={deleteDomain}>Delete</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		}
	}
];

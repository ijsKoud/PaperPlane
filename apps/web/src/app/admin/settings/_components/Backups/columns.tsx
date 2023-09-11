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
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontalIcon } from "lucide-react";
import axios, { AxiosError } from "axios";
import { useToast } from "@paperplane/ui/use-toast";
import { ToastAction } from "@paperplane/ui/toast";

export const columns: ColumnDef<{ name: string }>[] = [
	{
		accessorKey: "name",
		header: "Name"
	},
	{
		id: "actions",
		cell: ({ row }) => {
			const { toast } = useToast();
			const name = row.getValue("name") as string;

			async function importBackup() {
				try {
					await axios.delete("/api/admin/backups/import", { data: { id: name } });
					toast({
						title: "Backup imported",
						description: `${name} has been imported, please restart the server as soon as possible for the changes to be processed.`
					});
				} catch (err) {
					const _error = "isAxiosError" in err ? (err as AxiosError<{ message: string }>).response?.data.message : "";
					const error = _error || "n/a";

					console.log(err);

					toast({
						variant: "destructive",
						title: "Uh oh! Something went wrong",
						description: `There was a problem with your request: ${error}`,
						action: (
							<ToastAction altText="Try again" onClick={importBackup}>
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
						<DropdownMenuItem onClick={() => void navigator.clipboard.writeText(name)}>Copy</DropdownMenuItem>
						<DropdownMenuItem onClick={importBackup}>Import</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		}
	}
];

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
import { useToast } from "@paperplane/ui/use-toast";
import { ToastAction } from "@paperplane/ui/toast";
import { api } from "#trpc/server";

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
					await api().v1.admin.backup.import.mutate(name.replace(".zip", ""));
					toast({
						title: "Backup import in progress",
						description: `${name} is being imported, you can track its status via the backups menu. Once completed, a server restart is required.`
					});
				} catch (err) {
					console.log(err);

					toast({
						variant: "destructive",
						title: "Uh oh! Something went wrong",
						description: `There was a problem with your request: ${err.message}`,
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

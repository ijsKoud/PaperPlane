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
import { formatDate, getProtocol } from "@paperplane/utils";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontalIcon } from "lucide-react";
import Link from "next/link";
import { useToast } from "@paperplane/ui/use-toast";
import { ToastAction } from "@paperplane/ui/toast";
import { UpdateDialog } from "../UpdateDialog";
import { useState } from "react";
import { api } from "#trpc/server";
import { File } from "../FilesDisplay";

export const columns: ColumnDef<File>[] = [
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
		accessorKey: "name",
		header: "Name"
	},
	{
		accessorKey: "size",
		header: "Size"
	},
	{
		accessorKey: "visible",
		header: "Visibility",
		cell: ({ row }) => {
			const boolean = row.getValue("visible") as boolean;
			return <p>{boolean ? "public" : "private"}</p>;
		}
	},
	{
		accessorKey: "password",
		header: "Password",
		cell: ({ row }) => {
			const boolean = row.getValue("password") as boolean;
			return <p>{boolean ? "enabled" : "disabled"}</p>;
		}
	},
	{
		accessorKey: "views",
		header: "Views"
	},
	{
		accessorKey: "date",
		header: "Created At",
		cell: ({ row }) => {
			const date = row.getValue("date") as Date;
			return <p>{formatDate(date)}</p>;
		}
	},
	{
		id: "actions",
		cell: ({ row }) => {
			const { toast } = useToast();
			const [isOpen, setIsOpen] = useState(false);

			const name = row.getValue("name") as string;
			const visible = row.getValue("visible") as boolean;
			const password = row.getValue("password") as boolean;
			const shorturl = `${getProtocol()}${location.host}/files/${name}`;

			async function deleteFile() {
				try {
					await api().v1.dashboard.files.delete.mutate([name]);
					toast({ title: "File Deleted", description: `${name} has been deleted.` });
				} catch (err) {
					toast({
						variant: "destructive",
						title: "Uh oh! Something went wrong",
						description: `There was a problem with your request: ${err.message}`,
						action: (
							<ToastAction altText="Try again" onClick={deleteFile}>
								Try again
							</ToastAction>
						)
					});
				}
			}

			return (
				<DropdownMenu>
					<UpdateDialog name={name} visible={visible} passwordEnabled={password} isOpen={isOpen} setIsOpen={setIsOpen} />

					<DropdownMenuTrigger asChild>
						<Button variant="ghost" className="h-8 w-8 p-0">
							<span className="sr-only">Open menu</span>
							<MoreHorizontalIcon className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel>Actions</DropdownMenuLabel>
						<DropdownMenuSeparator />

						<DropdownMenuItem onClick={() => navigator.clipboard.writeText(shorturl)}>Copy URL</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<Link href={shorturl}>Open</Link>
						</DropdownMenuItem>

						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => setIsOpen(true)}>Edit</DropdownMenuItem>
						<DropdownMenuItem onClick={deleteFile}>Delete</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		}
	}
];

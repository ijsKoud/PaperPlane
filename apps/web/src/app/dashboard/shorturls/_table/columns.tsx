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
import { ApiUrl, formatDate, getProtocol } from "@paperplane/utils";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontalIcon } from "lucide-react";
import Link from "next/link";
import { useToast } from "@paperplane/ui/use-toast";
import { ToastAction } from "@paperplane/ui/toast";
import { UpdateDialog } from "../UpdateDialog";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@paperplane/ui/tooltip";
import { api } from "#trpc/server";

export const columns: ColumnDef<ApiUrl>[] = [
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
		accessorKey: "redirect",
		header: "URL",
		cell: ({ row }) => {
			const url = row.getValue("redirect") as string;
			return (
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<p className="overflow-hidden text-ellipsis max-w-xs whitespace-nowrap">{url}</p>
						</TooltipTrigger>

						<TooltipContent>
							<p className="max-w-[calc(100vh-32px)]">{url}</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			);
		}
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
		accessorKey: "visits",
		header: "Visits"
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
			const shorturl = `${getProtocol()}${location.host}/r/${name}`;

			async function deleteUrl() {
				try {
					await api().v1.dashboard.url.delete.mutate([name]);
					toast({ title: "URL Deleted", description: `${name} has been deleted.` });
				} catch (err) {
					toast({
						variant: "destructive",
						title: "Uh oh! Something went wrong",
						description: `There was a problem with your request: ${err.message}`,
						action: (
							<ToastAction altText="Try again" onClick={deleteUrl}>
								Try again
							</ToastAction>
						)
					});
				}
			}

			return (
				<DropdownMenu>
					<UpdateDialog name={name} visible={visible} isOpen={isOpen} setIsOpen={setIsOpen} />

					<DropdownMenuTrigger asChild>
						<Button variant="ghost" className="h-8 w-8 p-0">
							<span className="sr-only">Open menu</span>
							<MoreHorizontalIcon className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel>Actions</DropdownMenuLabel>
						<DropdownMenuSeparator />

						<DropdownMenuItem onClick={() => navigator.clipboard.writeText(shorturl)}>Copy</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<Link href={shorturl}>Open</Link>
						</DropdownMenuItem>

						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => setIsOpen(true)}>Edit</DropdownMenuItem>
						<DropdownMenuItem onClick={deleteUrl}>Delete</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		}
	}
];

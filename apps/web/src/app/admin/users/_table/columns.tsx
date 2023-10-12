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
import { formatDate } from "@paperplane/utils";
import { ColumnDef } from "@tanstack/react-table";
import { InfinityIcon, MoreHorizontalIcon } from "lucide-react";
import { useToast } from "@paperplane/ui/use-toast";
import { ToastAction } from "@paperplane/ui/toast";
import { UpdateDialog } from "../UpdateDialog";
import { useState } from "react";
import { PaperPlaneApiOutputs, api } from "#trpc/server";

export type Domain = PaperPlaneApiOutputs["v1"]["admin"]["users"]["list"]["entries"][0];

export const columns: ColumnDef<Domain>[] = [
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
		accessorKey: "disabled",
		header: "Access",
		cell: ({ row }) => {
			const boolean = row.getValue("disabled") as boolean;
			return <p>{boolean ? "restricted" : "unrestricted"}</p>;
		}
	},
	{
		accessorKey: "maxStorage",
		header: "Storage Limit",
		cell: ({ row }) => {
			const value = row.getValue("maxStorage") as string;
			if (value === "0.0 B") return <InfinityIcon className="h-4 w-4" aria-label="Infinite" />;
			return <span>{value}</span>;
		}
	},
	{
		accessorKey: "storage",
		header: "Storage Used"
	},
	{
		id: "actions",
		cell: ({ row, table }) => {
			const { toast } = useToast();
			const [isOpen, setIsOpen] = useState(false);
			const domain = table.options.data.find((dm) => dm.domain === (row.getValue("domain") as string));
			if (!domain) throw new Error("[USERS TABLE]: EXPECTED DOMAIN OBJECT BUT RECEIVED UNDEFINED");

			async function deleteUser() {
				try {
					await api().v1.admin.users.delete.mutate([domain!.domain]);
					toast({ title: "Domain Deleted", description: `${domain!.domain} has been deleted.` });
				} catch (err) {
					toast({
						variant: "destructive",
						title: "Uh oh! Something went wrong",
						description: `There was a problem with your request: ${err.message}`,
						action: (
							<ToastAction altText="Try again" onClick={deleteUser}>
								Try again
							</ToastAction>
						)
					});
				}
			}

			async function resetUser() {
				try {
					await api().v1.admin.users.resetAuth.mutate(domain!.domain);
					toast({
						title: "User Reset",
						description: `${domain!.domain} has been reset. They can now use the default backup code "paperplane-cdn".`
					});
				} catch (err) {
					toast({
						variant: "destructive",
						title: "Uh oh! Something went wrong",
						description: `There was a problem with your request: ${err.message}`,
						action: (
							<ToastAction altText="Try again" onClick={deleteUser}>
								Try again
							</ToastAction>
						)
					});
				}
			}

			return (
				<DropdownMenu>
					<UpdateDialog domain={domain} isOpen={isOpen} setIsOpen={setIsOpen} />

					<DropdownMenuTrigger asChild>
						<Button variant="ghost" className="h-8 w-8 p-0">
							<span className="sr-only">Open menu</span>
							<MoreHorizontalIcon className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel>Actions</DropdownMenuLabel>

						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => setIsOpen(true)}>Edit</DropdownMenuItem>
						<DropdownMenuItem onClick={deleteUser}>Delete</DropdownMenuItem>
						<DropdownMenuItem onClick={resetUser}>Reset Auth</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		}
	}
];

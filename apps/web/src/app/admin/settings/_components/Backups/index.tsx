"use client";

import { Button } from "@paperplane/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@paperplane/ui/dialog";
import { ArchiveIcon, ArchiveRestoreIcon } from "lucide-react";
import React from "react";
import axios, { AxiosError } from "axios";
import { useToast } from "@paperplane/ui/use-toast";
import { ScrollArea } from "@paperplane/ui/scroll-area";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { UseAdminBackups } from "../../../_lib/hooks";

export const Backups: React.FC = () => {
	const { toast } = useToast();
	const backups = UseAdminBackups();

	async function createBackup() {
		try {
			await axios.post("/api/admin/backups/create", undefined, { withCredentials: true });
			toast({ title: "Backup created", description: "A new backup has been created." });
		} catch (err) {
			const error = "isAxiosError" in err ? (err as AxiosError<{ message: string }>).response?.data.message || "n/a" : "n/a";
			toast({ variant: "destructive", title: "Uh oh! Something went wrong", description: `There was a problem with your request: ${error}` });
			console.log(err);
		}
	}

	return (
		<Dialog>
			<section className="w-full mt-4">
				<div className="mb-2">
					<h2 className="text-6 font-semibold">Backups</h2>
					<p>
						You can make a backup any time, we currently do not support automatic backups. You can find the backup files in the{" "}
						<strong>/backups</strong> directory on the server. To import a backup, move one to the folder or use an already created
						backup, press the import backup button and select it from the list.
					</p>
				</div>
				<div className="flex items-center gap-2 w-full">
					<DialogTrigger asChild>
						<Button variant="secondary">
							<ArchiveIcon className="mr-2 w-4 h-4" />
							Show Backups
						</Button>
					</DialogTrigger>
				</div>
			</section>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>Available Backups</DialogTitle>
					<DialogDescription>
						Here you can import and add backups. Note that once an import has started you will not be able to go back.
					</DialogDescription>
				</DialogHeader>

				<ScrollArea className="max-h-[50vh]">
					<DataTable {...backups} data={backups.entries.map((name) => ({ name }))} columns={columns} />

					<Button onClick={createBackup}>
						<ArchiveRestoreIcon className="mr-2 h-4 w-4" /> Create backup
					</Button>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
};

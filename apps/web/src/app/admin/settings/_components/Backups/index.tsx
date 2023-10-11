"use client";

import { Button } from "@paperplane/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@paperplane/ui/dialog";
import { ArchiveIcon, ArchiveRestoreIcon, Loader2 } from "lucide-react";
import React from "react";
import { useToast } from "@paperplane/ui/use-toast";
import { ScrollArea } from "@paperplane/ui/scroll-area";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { UseAdminBackups } from "../../../_lib/hooks";
import { api } from "#trpc/server";

export const Backups: React.FC = () => {
	const { toast } = useToast();
	const backups = UseAdminBackups();

	async function createBackup() {
		try {
			await api().v1.admin.backup.create.mutate();
			toast({ title: "Backup in progress", description: "A new is being created, you can track its status via the backups menu." });
		} catch (err) {
			toast({
				variant: "destructive",
				title: "Uh oh! Something went wrong",
				description: `There was a problem with your request: ${err.message}`
			});
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

					{backups.createInProgress && (
						<DialogDescription className="bg-red-400 p-2 rounded-md !text-white">
							A backup is currently being created, therefore you are unable to import a backup at the moment.
						</DialogDescription>
					)}

					{Boolean(backups.importInProgress) && (
						<DialogDescription className="bg-red-400 p-2 rounded-md !text-white">
							<strong>{backups.importInProgress}</strong> is currently being imported, therefore you are unable to create or import a
							backup at the moment.
						</DialogDescription>
					)}
				</DialogHeader>

				<ScrollArea className="max-h-[50vh]">
					<DataTable {...backups} data={backups.entries.map((name) => ({ name }))} columns={columns} />

					<Button onClick={createBackup} disabled={backups.createInProgress || Boolean(backups.importInProgress)}>
						{backups.createInProgress ? (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						) : (
							<ArchiveRestoreIcon className="mr-2 h-4 w-4" />
						)}{" "}
						Create backup
					</Button>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
};

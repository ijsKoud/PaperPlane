"use client";

import { Button } from "@paperplane/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@paperplane/ui/dialog";
import { MailIcon, MailPlusIcon } from "lucide-react";
import React from "react";
import axios, { AxiosError } from "axios";
import { useToast } from "@paperplane/ui/use-toast";
import { ScrollArea } from "@paperplane/ui/scroll-area";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { UseAdminInvites } from "../../../_lib/hooks";

export const Invites: React.FC = () => {
	const { toast } = useToast();
	const invites = UseAdminInvites();

	async function createNewInvite() {
		try {
			await axios.post("/api/invites/create", undefined, { withCredentials: true });
			toast({ title: "Invite created", description: "A new invite has been created." });
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
					<h2 className="text-6 font-semibold">Invite Codes</h2>
					Here you can remove and add <strong>single use</strong> invite codes. It is currently not possible to create multi-use codes.
					<p></p>
				</div>
				<div className="flex items-center gap-2 w-full">
					<DialogTrigger asChild>
						<Button variant="secondary">
							<MailIcon className="mr-2 w-4 h-4" />
							Invite Codes
						</Button>
					</DialogTrigger>
				</div>
			</section>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>Available Invite Codes</DialogTitle>
					<DialogDescription>
						Here you can remove and add <strong>single use</strong> invite codes. It is currently not possible to create multi-use codes.
					</DialogDescription>
				</DialogHeader>

				<ScrollArea className="max-h-[50vh]">
					<DataTable {...invites} data={invites.entries} columns={columns} />

					<Button onClick={createNewInvite}>
						<MailPlusIcon className="mr-2 h-4 w-4" /> Create Invite
					</Button>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
};

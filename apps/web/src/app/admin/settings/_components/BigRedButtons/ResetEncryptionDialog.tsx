"use client";

import React from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger
} from "@paperplane/ui/alert-dialog";
import { Button } from "@paperplane/ui/button";
import { KeyIcon } from "lucide-react";
import { useToast } from "@paperplane/ui/use-toast";
import { useRouter } from "next/navigation";
import { api } from "#trpc/server";

export const ResetEncryptionDialog: React.FC = () => {
	const { toast } = useToast();
	const router = useRouter();

	async function resetEncryption() {
		try {
			await api().v1.admin.settings.reset.mutate();
			toast({
				title: "Encryption reset",
				description: "The encryption has been reset and updated with a new secret."
			});
			router.push("/login?user=admin");
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
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant="destructive">
					<KeyIcon className="mr-2 h-4 w-4" /> Reset Encryption
				</Button>
			</AlertDialogTrigger>

			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone. Clear all authentication states and reset the encryption key.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={resetEncryption}>Continue</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

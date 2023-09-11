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
import axios, { AxiosError } from "axios";
import { useToast } from "@paperplane/ui/use-toast";
import { useRouter } from "next/navigation";

export const ResetEncryptionDialog: React.FC = () => {
	const { toast } = useToast();
	const router = useRouter();

	async function resetEncryption() {
		try {
			await axios.delete<string>("/api/admin/reset", { withCredentials: true });
			toast({
				title: "Encryption reset",
				description: "The encryption has been reset and updated with a new secret."
			});
			router.push("/login?user=admin");
		} catch (err) {
			const error = "isAxiosError" in err ? (err as AxiosError<{ message: string }>).response?.data.message || "n/a" : "n/a";
			toast({ variant: "destructive", title: "Uh oh! Something went wrong", description: `There was a problem with your request: ${error}` });
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

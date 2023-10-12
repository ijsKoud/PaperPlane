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
import { RotateCcwIcon } from "lucide-react";
import { useToast } from "@paperplane/ui/use-toast";
import { useRouter } from "next/navigation";
import { api } from "#trpc/server";

export const ResetAccountDialog: React.FC = () => {
	const { toast } = useToast();
	const router = useRouter();

	async function resetAccount() {
		try {
			await api().v1.dashboard.settings.reset.mutate();
			toast({
				title: "Account reset",
				description: "Your account has been reset. Use the code 'paperplane-cdn' to reset your password/2fa key."
			});
			router.push("/reset");
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
					<RotateCcwIcon className="mr-2 h-4 w-4" /> Reset Account
				</Button>
			</AlertDialogTrigger>

			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone. This will permanently delete all your uploaded files, pastebins and shorturls from our servers.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={resetAccount}>Continue</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

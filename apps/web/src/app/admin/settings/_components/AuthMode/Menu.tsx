"use client";

import { api } from "#trpc/server";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle
} from "@paperplane/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@paperplane/ui/select";
import { ToastAction } from "@paperplane/ui/toast";
import { useToast } from "@paperplane/ui/use-toast";
import React, { useState } from "react";

export const SelectMenu: React.FC<{ value: string }> = ({ value }) => {
	const { toast } = useToast();
	const [mode, setMode] = useState(value);
	const [dialog, setDialog] = useState(false);

	/** Updates the authentication mode */
	async function updateAuthenticationMode(v: string) {
		try {
			await api().v1.admin.settings.updateAuthMode.mutate(v as any);
			toast({ title: "Auth mode updated", description: `The authentication mode has been set to ${value}.` });
		} catch (error) {
			toast({
				variant: "destructive",
				title: "Uh oh! Something went wrong",
				description: `There was a problem with your request: ${error.message}`,
				action: (
					<ToastAction altText="try again" onClick={() => updateAuthenticationMode(value)}>
						Try Again
					</ToastAction>
				)
			});
			console.log(error);
		}
	}

	function onModeChange(v: string) {
		setMode(v);
		setDialog(true);
	}

	return (
		<>
			<AlertDialog open={dialog} onOpenChange={setDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will change the authentication mode and reset all the credentials. (The admin
							credentials will remain the same)
						</AlertDialogDescription>
					</AlertDialogHeader>

					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setMode((v) => (v === "2fa" ? "password" : "2fa"))}>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={() => updateAuthenticationMode(mode)}>Continue</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<Select value={mode} onValueChange={onModeChange}>
				<SelectTrigger className="!mt-4">
					<SelectValue />
				</SelectTrigger>

				<SelectContent>
					<SelectItem value="2fa">Multi Factor Authentication</SelectItem>
					<SelectItem value="password">Password Authentication</SelectItem>
				</SelectContent>
			</Select>
		</>
	);
};

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@paperplane/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@paperplane/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@paperplane/ui/form";
import { Input } from "@paperplane/ui/input";
import { Loader2, PenIcon } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Switch } from "@paperplane/ui/switch";
import axios, { AxiosError } from "axios";
import { useToast } from "@paperplane/ui/use-toast";
import { Checkbox } from "@paperplane/ui/checkbox";

export interface UpdateDialogProps {
	/** The name (id) of the url */
	name: string;

	/** The visibility state */
	visible: boolean;

	/** The password state */
	passwordEnabled: boolean;

	/** The dialog open state */
	isOpen: boolean;

	/** Set the dialog open state */
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const UpdateDialog: React.FC<UpdateDialogProps> = ({ name, visible, passwordEnabled, isOpen, setIsOpen }) => {
	const { toast } = useToast();
	const FormSchema = z.object({
		name: z.string().optional(),
		visible: z.boolean(),
		passwordEnabled: z.boolean(),
		password: z.string().optional()
	});

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: { visible, name, passwordEnabled }
	});

	async function onSubmit(data: z.infer<typeof FormSchema>) {
		try {
			data.passwordEnabled = data.password ? true : data.passwordEnabled;
			await axios.post(`/api/dashboard/files/${name}`, data, { withCredentials: true });
			toast({ title: "File updated", description: "The file has been updated." });
			form.reset(undefined, { keepDirty: false });
		} catch (err) {
			const error = "isAxiosError" in err ? (err as AxiosError<{ message: string }>).response?.data.message || "n/a" : "n/a";
			toast({ variant: "destructive", title: "Uh oh! Something went wrong", description: `There was a problem with your request: ${error}` });
			form.setFocus("name");
			console.log(err);
		}
	}

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogContent className="max-h-[calc(100vh-16px)] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Update the {name}</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Custom name</FormLabel>
									<Input {...field} placeholder="A custom name here (leave blank for auto-generation)" />
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Password</FormLabel>
									<FormDescription>A password which protects this file from unwanted users (optional)</FormDescription>
									<Input {...field} placeholder="A very secure password here..." />
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="passwordEnabled"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Password Enabled</FormLabel>
									<FormDescription>
										Whether or not the password protection is enabled or not (if a password is set and this option is disabled the
										password will be removed)
									</FormDescription>
									<Checkbox checked={field.value} onCheckedChange={field.onChange} aria-label="toggle password enabled" />
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="visible"
							render={({ field }) => (
								<FormItem>
									<FormItem className="flex flex-row items-center justify-between rounded-lg border dark:border-zinc-800 p-4">
										<div className="space-y-0.5">
											<FormLabel className="text-base">Visible to everyone</FormLabel>
											<FormDescription>
												Whether or not to make this url visible to everyone instead of only yourself.
											</FormDescription>
										</div>
										<FormControl>
											<Switch checked={field.value} onCheckedChange={field.onChange} />
										</FormControl>
									</FormItem>
								</FormItem>
							)}
						/>

						<Button type="submit" className="w-full" disabled={form.formState.isSubmitting || !form.formState.isValid}>
							{form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PenIcon className="mr-2 h-4 w-4" />}{" "}
							Update file
						</Button>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};

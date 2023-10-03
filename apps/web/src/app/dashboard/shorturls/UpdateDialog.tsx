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
import { useToast } from "@paperplane/ui/use-toast";
import { api } from "#trpc/server";
import { HandleTRPCFormError } from "#trpc/shared";

export interface UpdateDialogProps {
	/** The name (id) of the url */
	name: string;

	/** The visibility state */
	visible: boolean;

	/** The dialog open state */
	isOpen: boolean;

	/** Set the dialog open state */
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const UpdateDialog: React.FC<UpdateDialogProps> = ({ name, visible, isOpen, setIsOpen }) => {
	const { toast } = useToast();
	const FormSchema = z.object({
		name: z.string({ required_error: "A valid name must be provided" }),
		visible: z.boolean()
	});

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		values: { visible, name }
	});

	async function onSubmit(data: z.infer<typeof FormSchema>) {
		try {
			await api().v1.dashboard.url.update.mutate({ ...data, id: name });
			toast({ title: "Shorturl updated", description: "The url has been updated." });
		} catch (err) {
			HandleTRPCFormError(err, form, "name");
		}
	}

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogContent>
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
									<Input {...field} placeholder="The name of the shorturl here" />
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
							update url
						</Button>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};

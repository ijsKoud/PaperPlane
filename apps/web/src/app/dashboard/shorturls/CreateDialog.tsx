"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@paperplane/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@paperplane/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@paperplane/ui/form";
import { Input } from "@paperplane/ui/input";
import { LinkIcon, Loader2, PlusCircleIcon } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Switch } from "@paperplane/ui/switch";
import axios, { AxiosError } from "axios";
import { useToast } from "@paperplane/ui/use-toast";

export const CreateDialog: React.FC = () => {
	const { toast } = useToast();
	const FormSchema = z.object({
		url: z.string({ required_error: "A valid url is required" }).url("The provided content is not a url"),
		name: z.string().optional(),
		visible: z.boolean()
	});

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: { visible: true }
	});

	async function onSubmit(data: z.infer<typeof FormSchema>) {
		try {
			const response = await axios.post<string>("/api/dashboard/urls/create", data, { withCredentials: true });
			form.setFocus("url");
			void navigator.clipboard.writeText(response.data);
			toast({ title: "Shorturl created", description: "A new url has been created and has been copied to your clipboard." });
		} catch (err) {
			const error = "isAxiosError" in err ? (err as AxiosError<{ message: string }>).response?.data.message || "n/a" : "n/a";
			toast({ variant: "destructive", title: "Uh oh! Something went wrong", description: `There was a problem with your request: ${error}` });
			form.setFocus("url");
			console.log(err);
		}
	}

	return (
		<React.Fragment>
			<Dialog>
				<DialogTrigger asChild>
					<Button variant="outline">
						<LinkIcon className="mr-2 w-4 h-4" />
						Create url
					</Button>
				</DialogTrigger>

				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create a shorturl</DialogTitle>
						<DialogDescription>
							To create a shorturl, <strong>only a url is required</strong>. You can add a custom name and password if you want however
							those options are optional.
						</DialogDescription>
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
								name="url"
								render={({ field }) => (
									<FormItem>
										<FormLabel>URL to short</FormLabel>
										<Input {...field} placeholder="The url you want to make shorter" />
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
								{form.formState.isSubmitting ? (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								) : (
									<PlusCircleIcon className="mr-2 h-4 w-4" />
								)}{" "}
								Create url
							</Button>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</React.Fragment>
	);
};

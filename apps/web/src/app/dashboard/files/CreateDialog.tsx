"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@paperplane/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@paperplane/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@paperplane/ui/form";
import { Input } from "@paperplane/ui/input";
import { Loader2, UploadIcon } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Switch } from "@paperplane/ui/switch";
import type { AxiosError } from "axios";
import { useToast } from "@paperplane/ui/use-toast";
import Dropzone from "react-dropzone";
import { ApiErrorResponse, formatBytes } from "@paperplane/utils";
import FileUploader from "@paperplane/utils/FileUploader";

export const CreateDialog: React.FC = () => {
	const { toast } = useToast();
	const FormSchema = z.object({
		file: z.instanceof(File, { message: "A valid file must be provided" }),
		password: z.string().optional(),
		name: z.string().optional(),
		visible: z.boolean()
	});

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: { visible: true }
	});

	async function onSubmit(data: z.infer<typeof FormSchema>) {
		try {
			const uploader = new FileUploader(data.file);
			const url = await uploader.upload(data);

			void navigator.clipboard.writeText(url);
			toast({ title: "File uploaded", description: "A new file has been created and the url has been copied to your clipboard." });
			form.reset({ visible: true }, { keepDirty: false });
		} catch (err) {
			const errors = "isAxiosError" in err ? (err as AxiosError<ApiErrorResponse>).response?.data.errors ?? [] : [];
			toast({ variant: "destructive", title: "Uh oh! Something went wrong", description: "There was a problem with your request" });
			console.log(errors);

			for (const error of errors) {
				form.setError(error.field as any, { message: error.message });
			}
		}
	}

	return (
		<React.Fragment>
			<Dialog>
				<DialogTrigger asChild>
					<Button variant="outline">
						<UploadIcon className="mr-2 w-4 h-4" />
						Upload a file
					</Button>
				</DialogTrigger>

				<DialogContent>
					<DialogHeader>
						<DialogTitle>Upload a file</DialogTitle>
						<DialogDescription>
							To upload anything, <strong>only a file is needed</strong>. You can add a custom name and password if you want however
							those options are optional.
						</DialogDescription>
					</DialogHeader>

					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							<FormField
								control={form.control}
								name="file"
								render={({ field }) => (
									<FormItem>
										<FormLabel>File</FormLabel>

										<div className="flex items-center gap-2">
											<Dropzone maxFiles={1} multiple={false} onDropAccepted={(files) => field.onChange(files[0])}>
												{({ getRootProps, getInputProps }) => (
													<div
														{...getRootProps()}
														className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300"
													>
														<input {...getInputProps()} />
														<p>
															{field.value
																? `Selected: ${field.value.name} (${formatBytes(field.value.size)})`
																: "Drag and drop a file here, or click to select one"}
														</p>
													</div>
												)}
											</Dropzone>

											<Button variant="secondary" onClick={() => field.onChange(undefined)}>
												Reset
											</Button>
										</div>
										<FormMessage />
									</FormItem>
								)}
							/>

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
									<UploadIcon className="mr-2 h-4 w-4" />
								)}{" "}
								upload File
							</Button>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</React.Fragment>
	);
};

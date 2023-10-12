"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@paperplane/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@paperplane/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@paperplane/ui/form";
import { Input } from "@paperplane/ui/input";
import { Loader2, PenIcon } from "lucide-react";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Switch } from "@paperplane/ui/switch";
import { useToast } from "@paperplane/ui/use-toast";
import { atomOneDark, atomOneLight } from "react-syntax-highlighter/dist/cjs/styles/hljs";
import SyntaxHighlighter from "react-syntax-highlighter";
import { useTheme } from "next-themes";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@paperplane/ui/select";
import { Checkbox } from "@paperplane/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@paperplane/ui/tabs";
import { Textarea } from "@paperplane/ui/textarea";
import { api } from "#trpc/server";
import { getTRPCError } from "@paperplane/utils";

export interface UpdateDialogProps {
	/** The name (id) of the url */
	name: string;

	/** The visibility state */
	visible: boolean;

	/** The password state */
	passwordEnabled: boolean;

	/** The highlight type */
	highlight: string;

	/** The pastebin data */
	data: string;

	/** The dialog open state */
	isOpen: boolean;

	/** Set the dialog open state */
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const UpdateDialog: React.FC<UpdateDialogProps> = ({ name, visible, data, highlight, passwordEnabled, isOpen, setIsOpen }) => {
	const { toast } = useToast();
	const { theme } = useTheme();
	const FormSchema = z.object({
		name: z.string().optional(),
		visible: z.boolean(),
		passwordEnabled: z.boolean(),
		data: z.string().nonempty("Pastebin content is required"),
		highlight: z.union(SyntaxHighlighter.supportedLanguages.map((language) => z.literal(language)) as any),
		password: z.string().optional()
	});

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: { visible, name, data, highlight, passwordEnabled }
	});

	useEffect(() => {
		if (!form.formState.isDirty) form.setValue("data", data);
	}, [data]);

	async function onSubmit(data: z.infer<typeof FormSchema>) {
		try {
			data.passwordEnabled = data.password ? true : data.passwordEnabled;
			await api().v1.dashboard.bins.update.mutate({ ...data, highlight: data.highlight ?? "", id: name });
			toast({ title: "Pastebin updated", description: "The pastebin has been updated." });
		} catch (err) {
			const parsedError = getTRPCError(err.message);
			if (!parsedError) {
				console.error(err);
				form.setError("name", { message: "Unknown error, please try again later." });
				return;
			}

			const inputField = parsedError.field as keyof z.infer<typeof FormSchema>;
			if (Boolean(form.getValues()[inputField])) form.setError(inputField, { message: parsedError.message });
			console.error(parsedError);
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
									<FormDescription>A password which protects this pastebin from unwanted users (optional)</FormDescription>
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
							name="highlight"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Highlight</FormLabel>
									<Select required value={field.value} onValueChange={field.onChange}>
										<FormControl>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Select a valid highlight type" />
											</SelectTrigger>
										</FormControl>
										<SelectContent className="overflow-y-auto max-h-56">
											{SyntaxHighlighter.supportedLanguages.map((language, key) => (
												<SelectItem key={key} value={language}>
													{language}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="data"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Pastebin Content</FormLabel>
									<Tabs defaultValue="editor">
										<TabsList>
											<TabsTrigger value="editor">Editor</TabsTrigger>
											<TabsTrigger value="preview">Preview</TabsTrigger>
										</TabsList>
										<TabsContent value="editor">
											<Textarea {...field} placeholder="Your inspiring qoutes here..." />
										</TabsContent>
										<TabsContent value="preview">
											<SyntaxHighlighter
												language={form.getValues().highlight}
												style={theme === "light" ? atomOneLight : atomOneDark}
												showLineNumbers
											>
												{field.value}
											</SyntaxHighlighter>
										</TabsContent>
									</Tabs>

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
							Update pastebin
						</Button>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};

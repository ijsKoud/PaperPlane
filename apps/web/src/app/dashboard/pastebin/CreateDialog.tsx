"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@paperplane/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@paperplane/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@paperplane/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@paperplane/ui/tabs";
import { Textarea } from "@paperplane/ui/textarea";
import { Input } from "@paperplane/ui/input";
import { FilePlus2Icon, Loader2 } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Switch } from "@paperplane/ui/switch";
import axios, { AxiosError } from "axios";
import { useToast } from "@paperplane/ui/use-toast";
import { atomOneDark, atomOneLight } from "react-syntax-highlighter/dist/cjs/styles/hljs";
import SyntaxHighlighter from "react-syntax-highlighter";
import { useTheme } from "next-themes";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@paperplane/ui/select";

export const CreateDialog: React.FC = () => {
	const { toast } = useToast();
	const { theme } = useTheme();
	const FormSchema = z.object({
		name: z.string().optional(),
		visible: z.boolean(),
		data: z.string().nonempty("Pastebin content is required"),
		highlight: z.union(SyntaxHighlighter.supportedLanguages.map((language) => z.literal(language)) as any),
		password: z.string().optional()
	});

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: { visible: true, highlight: "plaintext" }
	});

	async function onSubmit(data: z.infer<typeof FormSchema>) {
		try {
			const response = await axios.post<string>("/api/dashboard/paste-bins/create", data, { withCredentials: true });
			form.setFocus("data");
			void navigator.clipboard.writeText(response.data);
			toast({ title: "Pastebin created", description: "A new pastebin has been created and the url has been copied to your clipboard." });
		} catch (err) {
			const error = "isAxiosError" in err ? (err as AxiosError<{ message: string }>).response?.data.message || "n/a" : "n/a";
			toast({ variant: "destructive", title: "Uh oh! Something went wrong", description: `There was a problem with your request: ${error}` });
			form.setFocus("data");
			console.log(err);
		}
	}

	return (
		<React.Fragment>
			<Dialog>
				<DialogTrigger asChild>
					<Button variant="outline">
						<FilePlus2Icon className="mr-2 w-4 h-4" />
						Create pastebin
					</Button>
				</DialogTrigger>

				<DialogContent className="max-h-[calc(100vh-16px)] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Create a pastebin</DialogTitle>
						<DialogDescription>
							To create a pastebin, <strong>only the data and highlight type are required</strong>. You can add a custom name and
							password if you want however those options are optional.
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
								{form.formState.isSubmitting ? (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								) : (
									<FilePlus2Icon className="mr-2 h-4 w-4" />
								)}{" "}
								Create pastebin
							</Button>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</React.Fragment>
	);
};

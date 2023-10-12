"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@paperplane/ui/input";
import { Button } from "@paperplane/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@paperplane/ui/dialog";
import { Form, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@paperplane/ui/form";
import { Loader2, PaletteIcon } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Textarea } from "@paperplane/ui/textarea";
import { useToast } from "@paperplane/ui/use-toast";
import { api } from "#trpc/server";
import { HandleTRPCFormError } from "#trpc/shared";

interface EmbedSettingsDialogProps {
	/** The title of the embed */
	title: string;

	/** The embed description */
	description: string;

	/** The embed color */
	color: string;
}

export const EmbedSettingsDialog: React.FC<EmbedSettingsDialogProps> = ({ title, color, description }) => {
	const { toast } = useToast();
	const FormSchema = z.object({
		description: z.string().optional(),
		title: z.string({ required_error: "A title is required" }),
		color: z.string({ required_error: "A color is required" }).regex(/\#[0-9A-Fa-f]{6}/g, "Invalid color provided")
	});

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		values: { title, description, color }
	});

	async function onSubmit(data: z.infer<typeof FormSchema>) {
		try {
			await api().v1.dashboard.settings.updateEmbed.mutate(data);
			toast({ title: "Settings updated", description: "The embed settings have been updated." });
		} catch (err) {
			HandleTRPCFormError(err, form, "title");
		}
	}

	return (
		<Dialog onOpenChange={() => form.reset()}>
			<DialogTrigger asChild>
				<Button variant="secondary">
					<PaletteIcon className="mr-2 h-4 w-4" />
					Edit Embed
				</Button>
			</DialogTrigger>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>Editing the embed settings</DialogTitle>
					<DialogDescription>
						Here you can edit the embed settings (OG Metadata). A title and color is required, the description is optional.
					</DialogDescription>

					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							<FormField
								control={form.control}
								name="title"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Embed title</FormLabel>
										<Input value={field.value} onChange={field.onChange} placeholder="Embed title here..." />
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Embed description</FormLabel>
										<FormDescription>{"Tags are supported, look at this: {file_date}, {file_size}, {file_name}"}</FormDescription>
										<Textarea value={field.value} onChange={field.onChange} placeholder="Embed description here here..." />
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="color"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Embed color</FormLabel>
										<Input type="color" value={field.value} onChange={field.onChange} />
										<FormMessage />
									</FormItem>
								)}
							/>

							<Button type="submit" disabled={form.formState.isSubmitting || !form.formState.isValid}>
								{form.formState.isSubmitting ? (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								) : (
									<PaletteIcon className="mr-2 h-4 w-4" />
								)}{" "}
								Update embed settings
							</Button>
						</form>
					</Form>
				</DialogHeader>
			</DialogContent>
		</Dialog>
	);
};

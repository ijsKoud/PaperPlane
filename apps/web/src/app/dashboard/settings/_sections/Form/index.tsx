"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@paperplane/ui/input";
import { Button } from "@paperplane/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@paperplane/ui/form";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, Settings2Icon } from "lucide-react";
import { DashboardSettingsGetApi } from "@paperplane/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@paperplane/ui/select";
import { Switch } from "@paperplane/ui/switch";
import axios, { AxiosError } from "axios";
import { useToast } from "@paperplane/ui/use-toast";

type SettingsFormProps = Omit<DashboardSettingsGetApi, "tokens">;

const SettingsForm: React.FC<SettingsFormProps> = ({ nameLength, nameStrategy, embedEnabled }) => {
	const { toast } = useToast();
	const FormSchema = z.object({
		embedEnabled: z.boolean(),
		nameLength: z.number({ required_error: "A valid name length is required" }).min(4, "The minimum length is 4 characters long"),
		nameStrategy: z.union([z.literal("name"), z.literal("id"), z.literal("zerowidth")], {
			required_error: "A valid name strategy must be selected",
			invalid_type_error: "The provided strategy does not exist "
		})
	});

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		values: { nameLength, nameStrategy, embedEnabled }
	});

	async function onSubmit(data: z.infer<typeof FormSchema>) {
		try {
			await axios.post<string>("/api/dashboard/settings", data, { withCredentials: true });
			toast({ title: "Settings updated", description: "The settings have been updated." });
		} catch (err) {
			const error = "isAxiosError" in err ? (err as AxiosError<{ message: string }>).response?.data.message || "n/a" : "n/a";
			toast({ variant: "destructive", title: "Uh oh! Something went wrong", description: `There was a problem with your request: ${error}` });
			form.setFocus("nameLength");
			console.log(err);
		}
	}

	return (
		<div>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					<FormField
						control={form.control}
						name="nameLength"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="!text-6 font-semibold">Name Length</FormLabel>
								<FormDescription>
									You can also define the name length below. We recommend a length between 8 and 12 characters. (with a minimum of 4
									characters)
								</FormDescription>
								<Input
									type="number"
									value={field.value}
									onChange={(ev) => field.onChange(Number(ev.currentTarget.value))}
									placeholder="Your name length here..."
								/>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="nameStrategy"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="!text-6 font-semibold">Name Generation Strategy</FormLabel>
								<FormDescription>
									PaperPlane gives every uploaded file or created shorturl a name, you can define how it is created below.{" "}
									<strong>ID</strong> is a unique generated id, <strong>name</strong> will be the name of the original file.{" "}
									<strong>Zerowidth</strong> is an id using zerowidth characters.
								</FormDescription>

								<Select required value={field.value} onValueChange={field.onChange}>
									<FormControl>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Select a valid name strategy" />
										</SelectTrigger>
									</FormControl>
									<SelectContent className="overflow-y-auto max-h-56">
										{["id", "name", "zerowidth"].map((strategy, key) => (
											<SelectItem key={key} value={strategy}>
												{strategy}
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
						name="embedEnabled"
						render={({ field }) => (
							<FormItem>
								<FormItem className="flex flex-row items-center justify-between rounded-lg border dark:border-zinc-800 p-4">
									<div className="space-y-0.5">
										<FormLabel className="text-base">OG Embed</FormLabel>
										<FormDescription>
											Whether or not to enable the OG Embed metadata (will show an embed on Discord)
										</FormDescription>
									</div>
									<FormControl>
										<Switch checked={field.value} onCheckedChange={field.onChange} />
									</FormControl>
								</FormItem>
							</FormItem>
						)}
					/>

					<Button type="submit" disabled={form.formState.isSubmitting || !form.formState.isValid}>
						{form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Settings2Icon className="mr-2 h-4 w-4" />}{" "}
						Update settings
					</Button>
				</form>
			</Form>
		</div>
	);
};

export default SettingsForm;

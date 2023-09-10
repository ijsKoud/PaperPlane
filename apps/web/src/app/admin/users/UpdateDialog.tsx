"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@paperplane/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@paperplane/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@paperplane/ui/form";
import { Input } from "@paperplane/ui/input";
import { Loader2, PenIcon } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Switch } from "@paperplane/ui/switch";
import axios, { AxiosError } from "axios";
import { useToast } from "@paperplane/ui/use-toast";
import { Domain, STORAGE_UNITS, TIME_UNITS_ARRAY, formatBytes, parseToDay } from "@paperplane/utils";
import ms from "ms";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@paperplane/ui/select";
import { ScrollArea } from "@paperplane/ui/scroll-area";

export interface UpdateDialogProps {
	/** The domain to edit */
	domain: Domain;

	/** The dialog open state */
	isOpen: boolean;

	/** Set the dialog open state */
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const getStorage = (storage: number): string[] => {
	const res = formatBytes(storage);
	return res.split(/ +/g);
};

export const UpdateDialog: React.FC<UpdateDialogProps> = ({ domain, isOpen, setIsOpen }) => {
	const { toast } = useToast();
	const FormSchema = z.object({
		storage: z.number({ required_error: "A max storage is required" }).min(0, "Storage cannot be below 0 K.B"),
		storageUnit: z.string().refine((arg) => STORAGE_UNITS.includes(arg as any), "The provided unit is not valid"),
		uploadSize: z.number({ required_error: "An upload size is required" }).min(0, "Upload size cannot be below 0 K.B"),
		uploadSizeUnit: z.string().refine((arg) => STORAGE_UNITS.includes(arg as any), "The provided unit is not valid"),
		extensions: z.array(z.string()),
		extensionsMode: z.union([z.literal("pass"), z.literal("block")], {
			invalid_type_error: "The provided mode is not valid",
			required_error: "An extension mode is required"
		}),
		auditlog: z.number({ required_error: "An auditlog duration is required" }).min(0, "Auditlog duration cannot be below 0 seconds"),
		auditlogUnit: z.string().refine((arg) => TIME_UNITS_ARRAY.includes(arg as any), "The provided unit is not valid"),
		disabled: z.boolean()
	});

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		values: {
			disabled: domain.disabled,
			extensions: domain.extensions,
			extensionsMode: domain.extensionsMode,
			storage: Number(getStorage(domain.maxStorage)[0]),
			storageUnit: getStorage(domain.maxStorage)[1] as any,
			uploadSize: Number(getStorage(domain.uploadSize)[0]),
			uploadSizeUnit: getStorage(domain.uploadSize)[1] as any,
			auditlog: Number(
				ms(domain.auditlog)
					.split("")
					.filter((str) => !isNaN(Number(str)))
					.join("")
			),
			auditlogUnit: ms(domain.auditlog)
				.split("")
				.filter((str) => isNaN(Number(str)))
				.join("")
		}
	});

	async function onSubmit(data: z.infer<typeof FormSchema>) {
		try {
			await axios.put(
				"/api/admin/create",
				{
					domains: [domain.domain],
					disabled: data.disabled,
					extensions: data.extensions,
					extensionsMode: data.extensionsMode,
					auditlog: parseToDay(data.auditlog, data.auditlogUnit as any),
					storage: `${data.storage} ${data.storageUnit}`,
					uploadSize: `${data.uploadSize} ${data.uploadSizeUnit}`
				},
				{ withCredentials: true }
			);
			toast({ title: "User updated", description: "The user has been updated." });
		} catch (err) {
			const error = "isAxiosError" in err ? (err as AxiosError<{ message: string }>).response?.data.message || "n/a" : "n/a";
			toast({ variant: "destructive", title: "Uh oh! Something went wrong", description: `There was a problem with your request: ${error}` });
			form.setFocus("disabled");
			console.log(err);
		}
	}

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogContent>
				<ScrollArea className="max-h-[calc(100vh-128px)] pr-4">
					<DialogHeader>
						<DialogTitle>Update {domain.domain}</DialogTitle>
						<DialogDescription>
							You can edit an existing domain here. Any <strong>0</strong> values are converted to <strong>infinite</strong>!
						</DialogDescription>
					</DialogHeader>

					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-2">
							<FormField
								control={form.control}
								name="disabled"
								render={({ field }) => (
									<FormItem>
										<FormItem className="flex flex-row items-center justify-between rounded-lg border dark:border-zinc-800 p-4">
											<div className="space-y-0.5">
												<FormLabel className="text-base">Disabled</FormLabel>
												<FormDescription>
													You can disable and enable domains at anytime. Note: once a domain is disabled the user can no
													longer upload or access their dashboard, files and shorturls are also unavailable.
												</FormDescription>
											</div>
											<FormControl>
												<Switch checked={field.value} onCheckedChange={field.onChange} />
											</FormControl>
										</FormItem>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="flex items-center gap-2">
								<FormField
									control={form.control}
									name="storage"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-base">Max Storage</FormLabel>
											<FormDescription>
												This allows you to set the Upload Size for PaperPlane accounts when they are created. Note: if you use
												a reverse-proxy like NGINX, make sure to configure an upload limit there too, otherwise this will not
												work.
											</FormDescription>
											<FormControl>
												<Input value={field.value} onChange={field.onChange} placeholder="Valid amount here..." />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="storageUnit"
									render={({ field }) => (
										<FormItem className="mt-auto">
											<Select required value={field.value} onValueChange={field.onChange}>
												<FormControl>
													<SelectTrigger className="w-full">
														<SelectValue placeholder="Select a valid unit" />
													</SelectTrigger>
												</FormControl>
												<SelectContent className="overflow-y-auto max-h-56">
													{STORAGE_UNITS.map((unit, key) => (
														<SelectItem key={key} value={unit}>
															{unit}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="flex items-center gap-2">
								<FormField
									control={form.control}
									name="uploadSize"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-base">Upload Size</FormLabel>
											<FormDescription>
												This allows you to set the Upload Size for PaperPlane accounts when they are created. Note: if you use
												a reverse-proxy like NGINX, make sure to configure an upload limit there too, otherwise this will not
												work.
											</FormDescription>
											<FormControl>
												<Input value={field.value} onChange={field.onChange} placeholder="Valid amount here..." />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="uploadSizeUnit"
									render={({ field }) => (
										<FormItem className="mt-auto">
											<Select required value={field.value} onValueChange={field.onChange}>
												<FormControl>
													<SelectTrigger className="w-full">
														<SelectValue placeholder="Select a valid unit" />
													</SelectTrigger>
												</FormControl>
												<SelectContent className="overflow-y-auto max-h-56">
													{STORAGE_UNITS.map((unit, key) => (
														<SelectItem key={key} value={unit}>
															{unit}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="flex items-center gap-2">
								<FormField
									control={form.control}
									name="auditlog"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-base">Auditlog Duration</FormLabel>
											<FormDescription>
												This will determine the for how long the audit logs are visible. By default it is set to 1 month.
											</FormDescription>
											<FormControl>
												<Input value={field.value} onChange={field.onChange} placeholder="Valid amount here..." />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="auditlogUnit"
									render={({ field }) => (
										<FormItem className="mt-auto">
											<Select required value={field.value} onValueChange={field.onChange}>
												<FormControl>
													<SelectTrigger className="w-full">
														<SelectValue placeholder="Select a valid unit" />
													</SelectTrigger>
												</FormControl>
												<SelectContent className="overflow-y-auto max-h-56">
													{TIME_UNITS_ARRAY.map((unit, key) => (
														<SelectItem key={key} value={unit}>
															{unit}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="flex items-center gap-2">
								<FormField
									control={form.control}
									name="extensions"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-base">(Dis)Allowed Extensions</FormLabel>
											<FormDescription>
												This will allow you to accept/block the upload of certain file extensions (e.x. .png). Please use the
												following format when using this:{" "}
												<strong>{".<extension>,.<extension>,...etc (e.x.: .png,.jpg)."}</strong>
											</FormDescription>
											<FormControl>
												<Input
													value={field.value}
													onChange={(ctx) => field.onChange(ctx.currentTarget.value.split(","))}
													placeholder="Valid amount here..."
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="extensionsMode"
									render={({ field }) => (
										<FormItem className="mt-auto">
											<Select required value={field.value} onValueChange={field.onChange}>
												<FormControl>
													<SelectTrigger className="w-full">
														<SelectValue placeholder="Select a valid unit" />
													</SelectTrigger>
												</FormControl>
												<SelectContent className="overflow-y-auto max-h-56">
													{["block", "pass"].map((unit, key) => (
														<SelectItem key={key} value={unit}>
															{unit}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<Button type="submit" className="w-full" disabled={form.formState.isSubmitting || !form.formState.isValid}>
								{form.formState.isSubmitting ? (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								) : (
									<PenIcon className="mr-2 h-4 w-4" />
								)}{" "}
								update domain
							</Button>
						</form>
					</Form>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
};

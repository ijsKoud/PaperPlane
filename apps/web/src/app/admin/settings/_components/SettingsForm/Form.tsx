"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@paperplane/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@paperplane/ui/form";
import { Input } from "@paperplane/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@paperplane/ui/select";
import { useToast } from "@paperplane/ui/use-toast";
import { STORAGE_UNITS, SettingsGetApi, TIME_UNITS_ARRAY, formatBytes, parseToDay } from "@paperplane/utils";
import axios, { AxiosError } from "axios";
import { Loader2, PenIcon } from "lucide-react";
import ms from "ms";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const getStorage = (storage: number): string[] => {
	const res = formatBytes(storage);
	return res.split(/ +/g);
};

export const SettingsForm: React.FC<SettingsGetApi> = ({ defaults }) => {
	const { toast } = useToast();
	const FormSchema = z.object({
		signUpMode: z.union([z.literal("closed"), z.literal("open"), z.literal("invite")], {
			invalid_type_error: "The provided sign up mode is not valid",
			required_error: "A sign up mode is required"
		}),
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
		auditlogUnit: z.string().refine((arg) => TIME_UNITS_ARRAY.includes(arg as any), "The provided unit is not valid")
	});

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		values: {
			signUpMode: defaults.signUpMode,
			extensions: defaults.extensions,
			extensionsMode: defaults.extensionsMode,
			storage: Number(getStorage(defaults.maxStorage)[0]),
			storageUnit: getStorage(defaults.maxStorage)[1] as any,
			uploadSize: Number(getStorage(defaults.maxUploadSize)[0]),
			uploadSizeUnit: getStorage(defaults.maxUploadSize)[1] as any,
			auditlog: Number(
				ms(defaults.auditlog)
					.split("")
					.filter((str) => !isNaN(Number(str)))
					.join("")
			),
			auditlogUnit: ms(defaults.auditlog)
				.split("")
				.filter((str) => isNaN(Number(str)))
				.join("")
		}
	});

	async function onSubmit(data: z.infer<typeof FormSchema>) {
		try {
			await axios.post("/api/admin/settings", {
				...data,
				auditlog: parseToDay(data.auditlog, data.auditlogUnit as any),
				storage: `${data.storage} ${data.storageUnit}`,
				uploadSize: `${data.uploadSize} ${data.uploadSizeUnit}`
			});
			toast({ title: "Settings updated", description: "The settings have been updated." });
		} catch (err) {
			const error = "isAxiosError" in err ? (err as AxiosError<{ message: string }>).response?.data.message || "n/a" : "n/a";
			toast({ variant: "destructive", title: "Uh oh! Something went wrong", description: `There was a problem with your request: ${error}` });
			console.log(err);
		}
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-2">
				<FormField
					control={form.control}
					name="signUpMode"
					render={({ field }) => (
						<FormItem className="mt-auto">
							<FormLabel className="text-base">Sign Up Mode</FormLabel>
							<FormDescription>
								Changes the way sign ups are handled. If set to <strong>closed</strong> the signup page is disabled (default).{" "}
								<strong>Open</strong> means the page is open and everyone can create an account (not recommended),{" "}
								<strong>invite</strong> will allow you to generate and hand out invite codes which are then required to sign up. These
								tokens are only usable once.
							</FormDescription>
							<Select required value={field.value} onValueChange={field.onChange}>
								<FormControl>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Select a valid unit" />
									</SelectTrigger>
								</FormControl>
								<SelectContent className="overflow-y-auto max-h-56">
									{["closed", "open", "invite"].map((unit, key) => (
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

				<div className="flex items-center gap-2 w-full">
					<FormField
						control={form.control}
						name="storage"
						render={({ field }) => (
							<FormItem className="w-3/4">
								<FormLabel className="text-base">Max Storage</FormLabel>
								<FormDescription>
									This allows you to set the storage limit for PaperPlane accounts when they are created. Note: this does not remove
									files from accounts if the limit is exceeded after the change.
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
							<FormItem className="mt-auto w-1/4">
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

				<div className="flex items-center gap-2 w-full">
					<FormField
						control={form.control}
						name="uploadSize"
						render={({ field }) => (
							<FormItem className="w-3/4">
								<FormLabel className="text-base">Upload Size</FormLabel>
								<FormDescription>
									This allows you to set the Upload Size for PaperPlane accounts when they are created. Note: if you use a
									reverse-proxy like NGINX, make sure to configure an upload limit there too, otherwise this will not work.
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
							<FormItem className="mt-auto w-1/4">
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

				<div className="flex items-center gap-2 w-full">
					<FormField
						control={form.control}
						name="auditlog"
						render={({ field }) => (
							<FormItem className="w-3/4">
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
							<FormItem className="mt-auto w-1/4">
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

				<div className="flex items-center gap-2 w-full">
					<FormField
						control={form.control}
						name="extensions"
						render={({ field }) => (
							<FormItem className="w-3/4">
								<FormLabel className="text-base">(Dis)Allowed Extensions</FormLabel>
								<FormDescription>
									This will allow you to accept/block the upload of certain file extensions (e.x. .png). Please use the following
									format when using this: <strong>{".<extension>,.<extension>,...etc (e.x.: .png,.jpg)."}</strong>
								</FormDescription>
								<FormControl>
									<Input
										value={field.value?.join(",")}
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
							<FormItem className="mt-auto w-1/4">
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
					{form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PenIcon className="mr-2 h-4 w-4" />} Update
					settings
				</Button>
			</form>
		</Form>
	);
};

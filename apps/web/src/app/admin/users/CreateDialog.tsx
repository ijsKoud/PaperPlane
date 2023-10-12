"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@paperplane/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@paperplane/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@paperplane/ui/form";
import { Input } from "@paperplane/ui/input";
import { Loader2, PlusCircleIcon, UserIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@paperplane/ui/use-toast";
import { STORAGE_UNITS, TIME_UNITS_ARRAY, formatBytes } from "@paperplane/utils";
import ms from "ms";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@paperplane/ui/select";
import { ScrollArea } from "@paperplane/ui/scroll-area";
import { PaperPlaneApiOutputs, api } from "#trpc/server";
import { HandleTRPCFormError } from "#trpc/shared";

const getStorage = (storage: number): string[] => {
	const res = formatBytes(storage);
	return res.split(/ +/g);
};

type DefaultCreateOptions = PaperPlaneApiOutputs["v1"]["admin"]["users"]["getDefault"];

const useDefaultCreateOptions = () => {
	const [data, setData] = useState<DefaultCreateOptions>();
	useEffect(() => {
		void api().v1.admin.users.getDefault.query().then(setData);
	}, []);

	return data;
};

export const CreateDialog: React.FC = () => {
	const { toast } = useToast();
	const [extensionDisabled, setExtensionDisabled] = useState(true);
	const defaultCreateOptions = useDefaultCreateOptions();

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
		domain: z.string({ required_error: "The domain is a required option" }).refine((arg) => defaultCreateOptions?.domains.includes(arg)),
		extension: z.string()
	});

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		values: {
			extensions: defaultCreateOptions?.defaults.extensions ?? [],
			extensionsMode: defaultCreateOptions?.defaults.extensionsMode || "pass",
			storage: Number(getStorage(defaultCreateOptions?.defaults.maxStorage ?? 0)[0]),
			storageUnit: getStorage(defaultCreateOptions?.defaults.maxStorage ?? 0)[1] as any,
			uploadSize: Number(getStorage(defaultCreateOptions?.defaults.maxUploadSize ?? 0)[0]),
			uploadSizeUnit: getStorage(defaultCreateOptions?.defaults.maxUploadSize ?? 0)[1] as any,
			auditlog: Number(
				ms(defaultCreateOptions?.defaults.auditlog ?? 0)
					.split("")
					.filter((str) => !isNaN(Number(str)))
					.join("")
			),
			auditlogUnit: ms(defaultCreateOptions?.defaults.auditlog ?? 0)
				.split("")
				.filter((str) => isNaN(Number(str)))
				.join(""),
			domain: "",
			extension: ""
		}
	});

	async function onSubmit(data: z.infer<typeof FormSchema>) {
		try {
			await api().v1.admin.users.create.mutate(data);
			toast({ title: "User created", description: "A new user has been created." });
		} catch (err) {
			HandleTRPCFormError(err, form, "domain");
		}
	}

	const onDomainChange = (value: string, onChange: (...values: any[]) => void) => {
		onChange(value);
		setExtensionDisabled(!value.startsWith("*."));
	};

	return (
		<Dialog onOpenChange={() => form.reset()}>
			<DialogTrigger asChild>
				<Button variant="outline">
					<UserIcon className="mr-2 w-4 h-4" />
					Create User
				</Button>
			</DialogTrigger>

			<DialogContent>
				<ScrollArea className="max-h-[calc(100vh-128px)] pr-4">
					<DialogHeader>
						<DialogTitle>Create new user</DialogTitle>
						<DialogDescription>
							Creating an account as admin is always possible, keep in mind that you cannot set a password or get access to the 2FA
							code. The user will have to use the default back-up code <strong>paperplane-cdn</strong> to login.
						</DialogDescription>
					</DialogHeader>

					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-2">
							<div className="flex items-center gap-2">
								<FormField
									control={form.control}
									name="extension"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-base">Domain</FormLabel>
											<FormControl>
												<Input
													disabled={extensionDisabled}
													value={field.value}
													onChange={field.onChange}
													placeholder="Domain extension here..."
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="domain"
									render={({ field }) => (
										<FormItem className="mt-auto w-3/4">
											<Select required value={field.value} onValueChange={(value) => onDomainChange(value, field.onChange)}>
												<FormControl>
													<SelectTrigger className="w-full">
														<SelectValue placeholder="Select a valid unit" />
													</SelectTrigger>
												</FormControl>
												<SelectContent className="overflow-y-auto max-h-56">
													{defaultCreateOptions?.domains.map((domain, key) => (
														<SelectItem key={key} value={domain}>
															{domain}
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
													value={field.value.join(",")}
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
									<PlusCircleIcon className="mr-2 h-4 w-4" />
								)}{" "}
								Create user
							</Button>
						</form>
					</Form>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
};

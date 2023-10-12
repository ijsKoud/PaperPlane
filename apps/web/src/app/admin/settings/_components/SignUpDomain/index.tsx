"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@paperplane/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@paperplane/ui/dialog";
import { Form, FormField, FormItem, FormMessage } from "@paperplane/ui/form";
import { Input } from "@paperplane/ui/input";
import { GlobeIcon, Loader2, PlusCircleIcon } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@paperplane/ui/use-toast";
import { ScrollArea } from "@paperplane/ui/scroll-area";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { UseAdminDomains } from "../../../_lib/hooks";
import { api } from "#trpc/server";

export const SignUpDomain: React.FC = () => {
	const { toast } = useToast();
	const domains = UseAdminDomains();
	const FormSchema = z.object({
		domain: z
			.string({ required_error: "A domain is required" })
			.refine((arg) => !(arg.startsWith(".") || arg.endsWith(".") || arg.startsWith("-")))
	});

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema)
	});

	async function onSubmit(data: z.infer<typeof FormSchema>) {
		try {
			await api().v1.admin.domains.create.mutate(data.domain);
			form.reset();
			toast({ title: "Domain created", description: "A new sign up domain has been created" });
		} catch (err) {
			toast({
				variant: "destructive",
				title: "Uh oh! Something went wrong",
				description: `There was a problem with your request: ${err.message}`
			});
			form.setFocus("domain");
			console.log(err);
		}
	}

	return (
		<Dialog>
			<section className="w-full mt-4">
				<div className="mb-2">
					<h2 className="text-6 font-semibold">Sign Up Domains</h2>
					<p>
						To make sign ups/account creation possible, a domain (or multiple) have to be assigned to PaperPlane. You can assign a single
						domain, domain with subdomain or multiple of each.
					</p>
				</div>
				<div className="flex items-center gap-2 w-full">
					<DialogTrigger asChild>
						<Button variant="secondary">
							<GlobeIcon className="mr-2 w-4 h-4" />
							Available Domains List
						</Button>
					</DialogTrigger>
				</div>
			</section>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>Available Sign Up Domains</DialogTitle>
					<DialogDescription>
						Here you can remove and add domains users (and the admin) can choose to create an account. A <strong>wildcard</strong> domain
						(*.ijskoud.dev) will allow the user/admin to add their own sub-domain.
					</DialogDescription>
				</DialogHeader>

				<ScrollArea className="max-h-[50vh]">
					<DataTable {...domains} data={domains.entries} columns={columns} />

					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-2 w-full">
							<FormField
								control={form.control}
								name="domain"
								render={({ field }) => (
									<FormItem className="w-full">
										<Input {...field} placeholder="Example: cdn.ijskoud.dev, *.ijskoud.dev" />
										<FormMessage />
									</FormItem>
								)}
							/>

							<Button type="submit" className="w-fit" disabled={form.formState.isSubmitting || !form.formState.isValid}>
								{form.formState.isSubmitting ? (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								) : (
									<PlusCircleIcon className="mr-2 h-4 w-4" />
								)}{" "}
								Create
							</Button>
						</form>
					</Form>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
};

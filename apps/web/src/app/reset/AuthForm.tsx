"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@paperplane/ui/select";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@paperplane/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import React from "react";
import { Button } from "@paperplane/ui/button";
import { Loader2, KeyIcon } from "lucide-react";
import { Input } from "@paperplane/ui/input";
import { useRouter } from "next/navigation";
import { api } from "#trpc/server";
import { getTRPCError } from "@paperplane/utils";

export interface AuthFormProps {
	options: string[];
	user: string | undefined;
}

export const AuthForm: React.FC<AuthFormProps> = ({ options, user }) => {
	const router = useRouter();
	const defaultValue = user ? options.find((opt) => opt === user) : undefined;
	const FormSchema = z.object({
		domain: z
			.string({ required_error: "A valid domain is required" })
			.refine((arg) => options.includes(arg), { message: "Please select a valid domain" }),
		code: z.string({ required_error: "A valid backup code is required" })
	});

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: { domain: defaultValue }
	});

	const redirectUser = (value: string) => {
		router.push(`https://${value}/reset`);
	};

	async function onSubmit(data: z.infer<typeof FormSchema>) {
		try {
			await api().v1.auth.login.mutate({ domain: data.domain, code: `BC-${data.code}` });
			router.push("/dashboard/settings?action=reset-auth");
		} catch (err) {
			const parsedError = getTRPCError(err.message);
			if (!parsedError) {
				console.error(err);
				form.setError("code", { message: "Unknown error, please try again later." });
				return;
			}

			if (Boolean(Object.keys(form.getValues()).includes(parsedError.field)))
				form.setError(parsedError.field as any, { message: parsedError.message });
			console.error(parsedError);
		}
	}

	return (
		<div className="w-full">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					<FormField
						control={form.control}
						name="domain"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Domain</FormLabel>
								<Select required defaultValue={field.value} onValueChange={redirectUser}>
									<FormControl>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Select a domain" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{options.map((opt, key) => (
											<SelectItem key={key} value={opt}>
												{opt}
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
						name="code"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Backup Code</FormLabel>
								<Input {...field} placeholder="Backup code here...." />
								<FormMessage />
							</FormItem>
						)}
					/>

					<Button type="submit" className="w-full" disabled={form.formState.isSubmitting || !form.formState.isValid}>
						{form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyIcon className="mr-2 h-4 w-4" />} Reset
						credentials
					</Button>
				</form>
			</Form>
		</div>
	);
};

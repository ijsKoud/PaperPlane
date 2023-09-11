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
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";

export interface AuthFormProps {
	options: { value: string; label: string }[];
	user: string | undefined;
}

export const AuthForm: React.FC<AuthFormProps> = ({ options, user }) => {
	const router = useRouter();
	const defaultValue = user ? options.find((opt) => opt.value === user)?.value : undefined;
	const FormSchema = z.object({
		domain: z
			.string({ required_error: "A valid domain is required" })
			.refine((arg) => options.map((opt) => opt.value).includes(arg), { message: "Please select a valid domain" }),
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
			await axios.post("/api/auth/login", { ...data, code: `BC-${data.code}` });
			router.push("/dashboard/settings?action=reset-auth");
		} catch (err) {
			const _error = "isAxiosError" in err ? (err as AxiosError<{ message: string }>).response?.data.message : "";
			const error = _error || "Unknown error, please try again later.";
			form.setError("domain", { message: error });
			form.setError("code", { message: error });

			console.error(err);
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
											<SelectItem key={key} value={opt.value}>
												{opt.label}
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

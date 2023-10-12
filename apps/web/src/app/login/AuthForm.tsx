"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@paperplane/ui/select";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@paperplane/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import React, { useState } from "react";
import { Button } from "@paperplane/ui/button";
import { Loader2, LogInIcon } from "lucide-react";
import { Input } from "@paperplane/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "#trpc/server";
import { getTRPCError } from "@paperplane/utils";

export interface AuthFormProps {
	options: string[];
	user: string | undefined;
	mode: "2fa" | "password";
}

const AuthProps = {
	"2fa": {
		zod: z
			.string({ required_error: "A 6 digit two factor authentication code is required" })
			.length(6, { message: "The code should be 6 digits long" }),
		key: "code",
		title: "Two Factor Authentication Code",
		placeholder: "6 digit code here..."
	},
	password: {
		zod: z.string({ required_error: "Password must be provided" }),
		key: "password",
		title: "Password",
		placeholder: "Password here..."
	}
};

export const AuthForm: React.FC<AuthFormProps> = ({ mode, options, user }) => {
	const router = useRouter();
	const [authMode, setAuthMode] = useState(mode);

	const defaultValue = user ? options.find((opt) => opt === user) : undefined;
	const correctAuthProps = AuthProps[authMode];
	const FormSchema = z.object({
		domain: z
			.string({ required_error: "A valid domain is required" })
			.refine((arg) => options.map((opt) => opt).includes(arg), { message: "Please select a valid domain" }),
		[correctAuthProps.key]: correctAuthProps.zod
	});

	const redirectUser = (value: string, setValues: (...props: any) => void) => {
		setAuthMode(value === "admin" ? "2fa" : mode);

		if (value === "admin" || value === defaultValue) return setValues(value);
		router.push(`https://${value}/login`);
	};

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: { domain: defaultValue }
	});

	async function onSubmit(data: z.infer<typeof FormSchema>) {
		try {
			await api().v1.auth.login.mutate(data as any);
			void router.push(data.domain === "admin" ? "/admin" : "/dashboard");
		} catch (err) {
			const parsedError = getTRPCError(err.message);
			if (!parsedError) {
				console.error(err);
				form.setError(correctAuthProps.key, { message: "Unknown error, please try again later." });
				return;
			}

			if (Boolean(form.getValues()[parsedError.field])) form.setError(parsedError.field, { message: parsedError.message });
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
								<Select required defaultValue={field.value} onValueChange={(val) => redirectUser(val, field.onChange)}>
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
						name={correctAuthProps.key}
						render={({ field }) => (
							<FormItem>
								<FormLabel>{correctAuthProps.title}</FormLabel>
								<Input {...field} placeholder={correctAuthProps.placeholder} />
								<Button variant="link" className="!p-0 !mt-0" asChild>
									<Link href="/reset">Forgot your login credentials?</Link>
								</Button>
								<FormMessage />
							</FormItem>
						)}
					/>

					<Button type="submit" className="w-full" disabled={form.formState.isSubmitting || !form.formState.isValid}>
						{form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogInIcon className="mr-2 h-4 w-4" />}{" "}
						Sign in
					</Button>
				</form>
			</Form>
		</div>
	);
};

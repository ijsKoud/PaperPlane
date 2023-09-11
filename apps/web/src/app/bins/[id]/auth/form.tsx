"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@paperplane/ui/button";
import { Form, FormField, FormItem, FormMessage } from "@paperplane/ui/form";
import { Input } from "@paperplane/ui/input";
import { Loader2, LogInIcon } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";

export interface AuthFormProps {
	/** The Id of the file */
	id: string;
}

export const AuthForm: React.FC<AuthFormProps> = ({ id }) => {
	const router = useRouter();
	const FormSchema = z.object({
		password: z.string({ required_error: "A password is required" })
	});

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema)
	});

	async function onSubmit(data: z.infer<typeof FormSchema>) {
		try {
			await axios.post(`/api/bins/${id}`, data, { withCredentials: true });
			router.push(`/bins/${id}`);
		} catch (err) {
			const error = "isAxiosError" in err ? (err as AxiosError<{ message: string }>).response?.data.message || "n/a" : "n/a";
			form.setFocus("password");
			form.setError("password", { message: error });
			console.log(err);
		}
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem>
							<Input {...field} type="password" placeholder="password here..." />
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button type="submit" className="w-full" disabled={form.formState.isSubmitting || !form.formState.isValid}>
					{form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogInIcon className="mr-2 h-4 w-4" />}{" "}
					Authorize
				</Button>
			</form>
		</Form>
	);
};

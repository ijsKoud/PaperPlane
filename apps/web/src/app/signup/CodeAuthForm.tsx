"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@paperplane/ui/select";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@paperplane/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import React, { useState } from "react";
import { Button } from "@paperplane/ui/button";
import { Loader2, RocketIcon } from "lucide-react";
import { Input } from "@paperplane/ui/input";
import { useRouter } from "next/navigation";
import { CodesDialog } from "./CodesDialog";
import { api } from "#trpc/server";
import { getTRPCError } from "@paperplane/utils";
import { UseTwoFactorKey } from "#lib/auth";

export interface AuthFormProps {
	domains: string[];
	invite: boolean;
}

export const CodeAuthForm: React.FC<AuthFormProps> = ({ domains, invite }) => {
	const router = useRouter();
	const twoFactorKey = UseTwoFactorKey();

	const [backupCodes, setBackupCodes] = useState<string[]>([]);
	const [selectedDomain, setSelectedDomain] = useState("");
	const isSubdomainDisabled = !selectedDomain.startsWith("*.");

	const FormSchema = z.object({
		domain: z
			.string({ required_error: "A valid domain is required" })
			.refine((arg) => domains.includes(arg), { message: "Please select a valid domain" }),
		extension: z.string().refine((arg) => (isSubdomainDisabled ? true : Boolean(arg)), { message: "A valid subdomain must be provided" }),
		invite: invite ? z.string({ required_error: "A valid invite code is required" }) : z.string().optional(),
		auth: z
			.string({ required_error: "A 6 digit two factor authentication code is required" })
			.length(6, { message: "The code should be 6 digits long" })
	});

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema)
	});

	/**
	 * Closes the dialog showing the backup codes
	 */
	const closeCodesDialog = () => {
		setBackupCodes([]);
		router.push("/login");
	};

	/**
	 * Updates the field and selectedDomain states
	 * @param domain The updated value
	 * @param setter The field value setter
	 */
	const setDomain = (domain: string, setter: (...props: any[]) => void) => {
		setSelectedDomain(domain);
		setter(domain);
	};

	/**
	 * Compiles the domain data into a valid domain
	 * @returns
	 */
	const getDomain = () => {
		const { domain, extension } = form.getValues();
		if (domain?.startsWith("*.")) return `${extension}.${domain.replace("*.", "")}`;
		return domain;
	};

	async function onSubmit(data: z.infer<typeof FormSchema>) {
		try {
			const codes = await api().v1.auth.signup.createMfa.mutate({ ...data, key: twoFactorKey.key });
			setBackupCodes(codes);
		} catch (err) {
			const parsedError = getTRPCError(err.message);
			if (!parsedError) {
				console.error(err);
				form.setError("auth", { message: "Unknown error, please try again later." });
				return;
			}

			const inputField = parsedError.field as keyof z.infer<typeof FormSchema>;
			if (Boolean(form.getValues()[inputField])) form.setError(inputField, { message: parsedError.message });
			console.error(parsedError);
		}
	}

	return (
		<div className="w-full">
			<CodesDialog open={Boolean(backupCodes.length)} codes={backupCodes} close={closeCodesDialog} />

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					<FormField
						control={form.control}
						name="domain"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Domain</FormLabel>
								<Select required defaultValue={field.value} onValueChange={(value) => setDomain(value, field.onChange)}>
									<FormControl>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Select a domain" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{domains.map((domain, key) => (
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

					{!isSubdomainDisabled && (
						<FormField
							control={form.control}
							name="extension"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Sub Domain</FormLabel>
									<Input {...field} placeholder="Your own subdomain here..." />
									<FormMessage />
								</FormItem>
							)}
						/>
					)}

					{invite && (
						<FormField
							control={form.control}
							name="invite"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Invite Code</FormLabel>
									<Input {...field} placeholder="Your invite code here..." />
									<FormMessage />
								</FormItem>
							)}
						/>
					)}

					<div className="w-full flex gap-2 justify-center items-center max-sm:flex-col">
						<img src={twoFactorKey.getImage(getDomain())} alt="2fa qr-code" className="w-24 h-24 bg-white rounded-xl" />
						<p className="max-w-[325px]">
							Scan the QR code with chosen 2FA app and fill in the 6 digit code below. Alternatively, use the following code:{" "}
							<strong>{twoFactorKey.secret}</strong>
						</p>
					</div>

					<FormField
						control={form.control}
						name="auth"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Two Factor Authentication Code</FormLabel>
								<Input {...field} placeholder="6 digit code here..." />
								<FormMessage />
							</FormItem>
						)}
					/>

					<Button type="submit" className="w-full" disabled={form.formState.isSubmitting || !form.formState.isValid}>
						{form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RocketIcon className="mr-2 h-4 w-4" />}{" "}
						Start flying
					</Button>
				</form>
			</Form>
		</div>
	);
};

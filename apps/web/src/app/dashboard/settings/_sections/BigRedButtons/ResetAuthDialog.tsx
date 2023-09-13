"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@paperplane/ui/dialog";
import { Button } from "@paperplane/ui/button";
import { DownloadIcon, FingerprintIcon, Loader2 } from "lucide-react";
import axios, { AxiosError } from "axios";
import { useToast } from "@paperplane/ui/use-toast";
import { useSearchParams } from "next/navigation";
import { MFAGetApi } from "@paperplane/utils";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@paperplane/ui/form";
import { Input } from "@paperplane/ui/input";
import { saveAs } from "file-saver";

const UseMFAReset = () => {
	const [data, setData] = useState<MFAGetApi>();
	useEffect(() => {
		void axios.post("/api/auth/reset", undefined, { withCredentials: true }).then((res) => setData(res.data));
		const interval = setInterval(() => axios.post("/api/auth/reset", undefined, { withCredentials: true }).then((res) => setData(res.data)), 9e5);
		return () => clearInterval(interval);
	}, []);

	return data;
};

export const ResetAuthDialog: React.FC = () => {
	const { toast } = useToast();
	const searchParams = useSearchParams();
	const defaultOpen = searchParams?.get("action") === "reset-auth";

	const [backupCodes, setBackupCodes] = useState<string[]>([]);
	const mfa = UseMFAReset();

	const FormSchema = z.object({
		auth: z.string({ required_error: "This field is required" })
	});

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema)
	});

	async function onSubmit(data: z.infer<typeof FormSchema>) {
		try {
			const codes = await axios.patch<string[]>(
				"/api/auth/reset",
				{ ...data, key: Boolean(mfa?.key) ? mfa?.key : undefined },
				{ withCredentials: true }
			);
			setBackupCodes(codes.data);
		} catch (err) {
			const error = "isAxiosError" in err ? (err as AxiosError<{ message: string }>).response?.data.message || "n/a" : "n/a";
			toast({ variant: "destructive", title: "Uh oh! Something went wrong", description: `There was a problem with your request: ${error}` });
			form.setFocus("auth");
			console.log(err);
		}
	}

	const downloadCodes = () => {
		const blob = new Blob([backupCodes.join("\n")], {
			type: "data:application/json;charset=utf-8"
		});
		saveAs(blob, "paperplane-backup-codes.txt");
	};

	return (
		<Dialog defaultOpen={defaultOpen}>
			<DialogTrigger asChild>
				<Button variant="destructive">
					<FingerprintIcon className="mr-2 h-4 w-4" /> Reset 2FA/Password
				</Button>
			</DialogTrigger>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>Reset your mfa or password</DialogTitle>
					<DialogDescription>
						You are about to reset your MFA or password. After the reset you will be given a new set of back-up codes.
					</DialogDescription>
				</DialogHeader>

				{backupCodes.length ? (
					<div>
						{" "}
						<p className="text-4">
							Here are your backup codes, store them somewhere save because you this is the only time you will see them.
						</p>
						<div className="grid grid-cols-3">
							{backupCodes.map((code, key) => (
								<p
									key={key}
									className="text-4 overflow-hidden text-ellipsis font-semibold bg-zinc-200 dark:bg-zinc-800 m-1 p-2 rounded-md"
								>
									{code}
								</p>
							))}
						</div>
						<Button className="mt-2" onClick={() => downloadCodes()}>
							<DownloadIcon className="mr-2 h-4 w-4" /> Download Codes
						</Button>
					</div>
				) : (
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							{mfa?.key && (
								<div>
									<img
										alt="2FA QR Code"
										src={`https://chart.googleapis.com/chart?chs=166x166&chld=L|0&cht=qr&chl=${encodeURIComponent(mfa.uri)}`}
									/>
									<p className="text-4">
										Scan the QR-Code above or use the following Code: <strong>{mfa.secret}</strong>. Note: this resets every{" "}
										<strong>15 minutes</strong>!
									</p>
								</div>
							)}

							<FormField
								control={form.control}
								name="auth"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{mfa?.key ? "Two Factor Authentication Code" : "Password"}</FormLabel>
										<Input value={field.value} onChange={field.onChange} />
										<FormMessage />
									</FormItem>
								)}
							/>

							<Button type="submit" disabled={form.formState.isSubmitting || !form.formState.isValid}>
								{form.formState.isSubmitting ? (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								) : (
									<FingerprintIcon className="mr-2 h-4 w-4" />
								)}{" "}
								Reset MFA/Password
							</Button>
						</form>
					</Form>
				)}
			</DialogContent>
		</Dialog>
	);
};

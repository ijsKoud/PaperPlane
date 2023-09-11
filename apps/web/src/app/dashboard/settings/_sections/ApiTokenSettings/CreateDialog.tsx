"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@paperplane/ui/input";
import { Button } from "@paperplane/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@paperplane/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@paperplane/ui/form";
import { KeyIcon, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface CreateDialogProps {
	createApiToken: (name: string) => Promise<string>;
}

const CreateDialog: React.FC<CreateDialogProps> = ({ createApiToken }) => {
	const [token, setToken] = useState("test");
	const FormSchema = z.object({
		name: z.string({ required_error: "A name is required for the API Key" })
	});

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema)
	});

	async function onSubmit(data: z.infer<typeof FormSchema>) {
		try {
			const apiKey = await createApiToken(data.name);
			setToken(apiKey);
		} catch (err) {}
	}

	/** Resets the form and token state */
	const resetStates = () => {
		setToken("");
		form.reset();
	};

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button onClick={resetStates}>new API Key</Button>
			</DialogTrigger>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create a new API Key</DialogTitle>
					<DialogDescription>
						Give your API key an easy to understand name and make sure to save the key somewhere safe because you will only be able to see
						it once.
					</DialogDescription>

					{token ? (
						<div>
							API KEY: <strong>{token}</strong>
						</div>
					) : (
						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Name</FormLabel>
											<Input value={field.value} onChange={field.onChange} placeholder="A very nice API key name here..." />
											<FormMessage />
										</FormItem>
									)}
								/>

								<Button type="submit" disabled={form.formState.isSubmitting || !form.formState.isValid}>
									{form.formState.isSubmitting ? (
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									) : (
										<KeyIcon className="mr-2 h-4 w-4" />
									)}{" "}
									Create API Key
								</Button>
							</form>
						</Form>
					)}
				</DialogHeader>
			</DialogContent>
		</Dialog>
	);
};

export default CreateDialog;

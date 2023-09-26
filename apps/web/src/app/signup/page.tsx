import type React from "react";
import type { Metadata } from "next";
import { PageProps } from "@paperplane/utils";
import { headers } from "next/headers";
import { CodeAuthForm } from "./CodeAuthForm";
import { notFound } from "next/navigation";
import { PasswordAuthForm } from "./PasswordAuthForm";
import { api } from "#trpc/server";

export const metadata: Metadata = {
	title: "Create an account - Paperplane",
	description: "An open-source customisable solution to storing files in the cloud. ✈️"
};

async function getSignUpData() {
	const host = headers().get("host")!;
	const data = await api(host).v1.auth.signup.options.query();

	return data;
}

const Page: React.FC<PageProps> = async () => {
	const signUpData = await getSignUpData();
	if (signUpData.mode === "closed") notFound();

	return (
		<>
			<div className="pr-16 max-sm:pr-0">
				<h1 className="text-lg font-normal">Hello, time to create an account!</h1>
				<h2 className="text-xl">Lets get you settled</h2>
			</div>
			{signUpData.type === "2fa" ? (
				<CodeAuthForm domains={signUpData.domains} invite={signUpData.mode === "invite"} />
			) : (
				<PasswordAuthForm domains={signUpData.domains} invite={signUpData.mode === "invite"} />
			)}
		</>
	);
};

export default Page;

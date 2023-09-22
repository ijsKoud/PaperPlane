import type React from "react";
import type { Metadata } from "next";
import { PageProps, SearchParams, parseSearchParam } from "@paperplane/utils";
import { headers } from "next/headers";
import { AuthForm } from "./AuthForm";
import { api } from "../../trpc/server";

export const metadata: Metadata = {
	title: "Sign in to your account - Paperplane",
	description: "An open-source customisable solution to storing files in the cloud. ✈️"
};

async function getAuthMode() {
	const host = headers().get("host")!;
	const data = await api(host).v1.auth.accounts.query();

	return { ...data, host };
}

const Page: React.FC<PageProps<undefined, SearchParams<"user" | "type">>> = async ({ searchParams }) => {
	const mode = await getAuthMode();
	const user = parseSearchParam(searchParams.user) || mode.host;

	return (
		<>
			<div className="pr-16 max-sm:pr-0">
				<h1 className="text-lg font-normal">Welcome Back!</h1>
				<h2 className="text-xl">Sign in to your account</h2>
			</div>
			<AuthForm options={mode.accounts} mode={mode.mode} user={user} />
		</>
	);
};

export default Page;

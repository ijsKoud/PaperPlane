import type React from "react";
import type { Metadata } from "next";
import { headers, cookies } from "next/headers";
import { getAuthenticationState } from "../_lib/utils";
import { redirect } from "next/navigation";
import Settings from "./Settings";

export const metadata: Metadata = {
	title: "Settings - Paperplane",
	description: "An open-source customisable solution to storing files in the cloud. ✈️"
};

const Page: React.FC = async () => {
	const host = headers().get("host");
	const cookie = cookies().get("PAPERPLANE-AUTH");
	const authenticationState = await getAuthenticationState(host!, cookie?.value);
	if (!authenticationState.domain) redirect("/login");

	return (
		<>
			<div className="w-full">
				<h1 className="text-11 font-bold max-sm:text-center">Settings</h1>
			</div>
			<Settings />
		</>
	);
};

export default Page;

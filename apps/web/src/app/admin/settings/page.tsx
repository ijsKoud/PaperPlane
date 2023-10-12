import type React from "react";
import type { Metadata } from "next";
import { getAuthenticationState } from "../_lib/utils";
import { redirect } from "next/navigation";
import { AuthMode } from "./_components/AuthMode";
import SettingsForm from "./_components/SettingsForm";
import { SignUpDomain } from "./_components/SignUpDomain";
import { Invites } from "./_components/Invites";
import { Backups } from "./_components/Backups";
import BigRedButtons from "./_components/BigRedButtons";

export const metadata: Metadata = {
	title: "Admin Panel Settings - Paperplane",
	description: "An open-source customisable solution to storing files in the cloud. ✈️"
};

const Page: React.FC = async () => {
	const authenticationState = await getAuthenticationState();
	if (!authenticationState) redirect("/login?user=admin");

	return (
		<>
			<div className="w-full">
				<h1 className="text-11 font-bold max-sm:text-center">Settings</h1>
			</div>
			<AuthMode />
			<SettingsForm />
			<SignUpDomain />
			<Invites />
			<Backups />
			<BigRedButtons />
		</>
	);
};

export default Page;

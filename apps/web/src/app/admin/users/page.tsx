import type React from "react";
import type { Metadata } from "next";
import { getAuthenticationState } from "../_lib/utils";
import { redirect } from "next/navigation";
import { UsersTable } from "./UsersTable";

export const metadata: Metadata = {
	title: "Admin User Panel - Paperplane",
	description: "An open-source customisable solution to storing files in the cloud. ✈️"
};

const Page: React.FC = async () => {
	const authenticationState = await getAuthenticationState();
	if (!authenticationState) redirect("/login?user=admin");

	return (
		<>
			<div className="w-full">
				<h1 className="text-11 font-bold max-sm:text-center">Users</h1>
			</div>
			<UsersTable />
		</>
	);
};

export default Page;

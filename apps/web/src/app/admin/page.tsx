import type React from "react";
import type { Metadata } from "next";
import { getAuthenticationState } from "./_lib/utils";
import { redirect } from "next/navigation";
import Statistics from "./_Statistics";
import { Auditlog } from "./_Auditlog";

export const metadata: Metadata = {
	title: "Admin Panel - Paperplane",
	description: "An open-source customisable solution to storing files in the cloud. ✈️"
};

const Page: React.FC = async () => {
	const authenticationState = await getAuthenticationState();
	if (!authenticationState) redirect("/login?user=admin");

	return (
		<>
			<Statistics />
			<Auditlog />
		</>
	);
};

export default Page;

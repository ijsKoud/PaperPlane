import type React from "react";
import type { Metadata } from "next";
import { headers, cookies } from "next/headers";
import { getAuthenticationState } from "./_lib/utils";
import { redirect } from "next/navigation";
import Statistics from "./_Statistics";
import { Auditlog } from "./_Auditlog";

export const metadata: Metadata = {
	title: "Admin Panel - Paperplane",
	description: "An open-source customisable solution to storing files in the cloud. ✈️"
};

const Page: React.FC = async () => {
	const host = headers().get("host");
	const cookie = cookies().get("PAPERPLANE-ADMIN");
	const authenticationState = await getAuthenticationState(host!, cookie?.value);
	if (!authenticationState.admin) redirect("/login?user=admin");

	return (
		<>
			<Statistics />
			<Auditlog />
		</>
	);
};

export default Page;

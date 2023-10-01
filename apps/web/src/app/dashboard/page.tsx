import type React from "react";
import type { Metadata } from "next";
import { getAuthenticationState } from "./_lib/utils";
import { redirect } from "next/navigation";
import DashboardStats from "./Stats";
import { Auditlog } from "./Auditlog";

export const metadata: Metadata = {
	title: "Dashboard - Paperplane",
	description: "An open-source customisable solution to storing files in the cloud. ✈️"
};

const Page: React.FC = async () => {
	const authenticationState = await getAuthenticationState();
	if (!authenticationState) redirect("/login");

	return (
		<>
			<DashboardStats />
			<Auditlog />
		</>
	);
};

export default Page;

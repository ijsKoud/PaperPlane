import type React from "react";
import axios from "axios";
import { PageProps, Params, getProtocol } from "@paperplane/utils";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { AuthForm } from "./form";

export function generateMetadata({ params }: { params: Record<string, string> }) {
	return {
		title: `Paperplane - ${params.id}`,
		description: "An open-source customisable solution to storing files in the cloud. ✈️"
	};
}

const Page: React.FC<PageProps<Params<"id">>> = async ({ params }) => {
	const host = headers().get("host")!;
	const status = await axios.get(`${getProtocol()}${host}/api/internal/bins/${params.id}`, { headers: { Cookie: cookies().toString() } });
	if (typeof status.data === "object") redirect(`/bins/${params.id}`);

	return (
		<>
			<div>
				<h1 className="text-8 font-semibold">Enter pastebin password</h1>
				<h2 className="text-5">A password is required to view this shared pastebin.</h2>
			</div>
			<AuthForm id={params.id} />
		</>
	);
};

export default Page;

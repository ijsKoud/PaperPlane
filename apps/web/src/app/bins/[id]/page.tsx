import type React from "react";
import axios from "axios";
import { PageProps, Params, getProtocol } from "@paperplane/utils";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import PasteBin from "./PasteBin";

export function generateMetadata({ params }: { params: Record<string, string> }) {
	return {
		title: `Paperplane - Pastebin: ${params.id}`,
		description: "An open-source customisable solution to storing files in the cloud. ✈️"
	};
}

const Page: React.FC<PageProps<Params<"id">>> = async ({ params }) => {
	const host = headers().get("host")!;
	const bin = await axios.get(`${getProtocol()}${host}/api/v1/bins/${params.id}`, { headers: { Cookie: cookies().toString() } });
	if (typeof bin.data !== "object") redirect(`/bins/${params.id}/auth`);

	return <PasteBin id={params.id} {...bin.data} />;
};

export default Page;

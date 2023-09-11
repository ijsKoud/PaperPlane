import type React from "react";
import axios from "axios";
import { PageProps, Params, getProtocol } from "@paperplane/utils";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import FileView from "./FileView";

export async function generateMetadata({ params }: { params: Record<string, string> }): Promise<Metadata> {
	const host = headers().get("host")!;
	const { data: file } = await axios.get<FileResponse>(`${getProtocol()}${host}/api/files/${params.id}`, {
		headers: { Cookie: cookies().toString() }
	});

	const url = `${getProtocol()}${host}/files/${params.id}`;
	const openGraph: Metadata["openGraph"] = {};

	switch (file.type) {
		case "image":
			openGraph.images = [{ alt: params.id, url }];
			break;
		case "video":
			openGraph.videos = [{ url }];
			break;
		case "audio":
			openGraph.audio = [{ url }];
			break;
		case "unsupported":
		default:
			break;
	}

	return {
		title: file.embedTitle || `Paperplane - ${params.id}`,
		description: file.embedDescription,
		themeColor: file.embedColor,
		openGraph
	};
}

export interface FileResponse {
	data: string | undefined;
	charset: string;
	type: "image" | "video" | "audio" | "unsupported";

	embedTitle?: string;
	embedDescription?: string;
	embedColor?: string;
}

const Page: React.FC<PageProps<Params<"id">>> = async ({ params }) => {
	const host = headers().get("host")!;
	const { data: file } = await axios.get<FileResponse>(`${getProtocol()}${host}/api/files/${params.id}`, {
		headers: { Cookie: cookies().toString() }
	});
	if (typeof file !== "object") redirect(`/files/${params.id}/auth`);

	return <FileView {...file} id={params.id} />;
};

export default Page;

import { PrimaryButton } from "@paperplane/buttons";
import { getProtocol } from "@paperplane/utils";
import axios from "axios";
import type { GetServerSideProps, NextPage } from "next";
import { NextSeo } from "next-seo";
import type { OpenGraph } from "next-seo/lib/types";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
const Markdown = dynamic(() => import("@paperplane/markdown"));

export const getServerSideProps: GetServerSideProps = async (context) => {
	const { id: _id } = context.params!;
	const id = Array.isArray(_id) ? _id[0] : _id ?? "";
	const fileRes = await axios.get<Omit<Props, "openGraph">>(`${getProtocol()}${context.req.headers.host}/api/files/${id}`);

	const openGraph: OpenGraph = {};
	const url = `${getProtocol()}${context.req.headers.host}/files/${id}`;

	switch (fileRes.data.type) {
		case "image":
			openGraph.images = [{ alt: id, url }];
			break;
		case "video":
			openGraph.videos = [{ alt: id, url }];
			break;
		case "audio":
			openGraph.audio = [{ alt: id, url }];
			break;
		case "unsupported":
		default:
			break;
	}

	return {
		props: { ...fileRes.data, openGraph }
	};
};

interface Props {
	data: string | undefined;
	charset: string;
	type: "image" | "video" | "audio" | "unsupported";

	embedTitle?: string;
	embedDescription?: string;
	embedColor?: string;

	openGraph: OpenGraph;
}

const File: NextPage<Props> = ({ data, openGraph, charset, embedColor, embedDescription, embedTitle }) => {
	const router = useRouter();
	const onRawClick = () => {
		location.search = "raw=true";
	};

	return (
		<div className="w-screen h-screen relative">
			<NextSeo
				defaultTitle={router.asPath.split("/")[2]}
				openGraph={{ title: embedTitle, description: embedDescription, ...openGraph }}
				themeColor={embedColor}
			/>
			{charset === "UTF-8" ? <Markdown>{data ?? ""}</Markdown> : <iframe className="w-screen h-screen" src={`${router.asPath}?raw=true`} />}
			<PrimaryButton type="button" onClick={onRawClick} className="absolute z-50 right-2 top-2">
				Show Raw
			</PrimaryButton>
		</div>
	);
};

export default File;

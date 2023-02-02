import { PrimaryButton } from "@paperplane/buttons";
import { getProtocol } from "@paperplane/utils";
import axios from "axios";
import type { GetServerSideProps, NextPage } from "next";
import { NextSeo } from "next-seo";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
const Markdown = dynamic(() => import("@paperplane/markdown"));

export const getServerSideProps: GetServerSideProps = async (context) => {
	const { id } = context.params!;
	const fileRes = await axios.get<Props>(`${getProtocol()}${context.req.headers.host}/api/files/${id}`);

	return {
		props: fileRes.data
	};
};

interface Props {
	data: string | undefined;
	charset: string;
}

const File: NextPage<Props> = ({ data, charset }) => {
	const router = useRouter();
	const onRawClick = () => {
		location.search = "raw=true";
	};

	return (
		<div className="w-screen h-screen relative">
			<NextSeo defaultTitle={router.asPath.split("/")[2]} />
			{charset === "UTF-8" ? <Markdown>{data ?? ""}</Markdown> : <iframe className="w-screen h-screen" src={`${router.asPath}?raw=true`} />}
			<PrimaryButton type="button" onClick={onRawClick} className="absolute z-50 right-2 top-2">
				Show Raw
			</PrimaryButton>
		</div>
	);
};

export default File;

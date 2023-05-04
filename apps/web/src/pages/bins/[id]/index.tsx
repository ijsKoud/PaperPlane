import Markdown from "@paperplane/markdown";
import { getProtocol } from "@paperplane/utils";
import axios from "axios";
import type { GetServerSideProps, NextPage } from "next";
import { NextSeo } from "next-seo";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/cjs/styles/hljs";

export const getServerSideProps: GetServerSideProps = async (context) => {
	const { id: _id } = context.params!;
	const id = Array.isArray(_id) ? _id[0] : _id ?? "";
	const bin = await axios.get<{ data: string; highlight: string }>(`${getProtocol()}${context.req.headers.host}/api/bins/${id}`, {
		headers: { Cookie: context.req.headers.cookie }
	});

	if (typeof bin.data !== "object")
		return {
			props: {},
			redirect: { destination: `/bins/${id}/auth`, permanent: false }
		};

	if (!bin.data.data.length)
		return {
			props: {},
			notFound: true
		};

	return {
		props: { ...bin.data, id }
	};
};

interface Props {
	data: string;
	highlight: string;
	id: string;
}

const Pastebin: NextPage<Props> = ({ data, highlight, id }) => {
	return (
		<div className="w-screen min-h-screen">
			<NextSeo title={`pastebin • ${id}`} />
			{highlight === "markdown" ? (
				<Markdown>{data}</Markdown>
			) : (
				<SyntaxHighlighter style={atomOneDark} language={highlight} showLineNumbers>
					{data}
				</SyntaxHighlighter>
			)}
		</div>
	);
};

export default Pastebin;

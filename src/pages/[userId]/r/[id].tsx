import { GetServerSidePropsContext, NextPage } from "next";
import Head from "next/head";
import React, { useEffect } from "react";
import { fetch } from "../../../lib/fetch";

interface Props {
	linkId: string;
	link: string;
}

const LinkPage: NextPage<Props> = ({ linkId, link }) => {
	useEffect(() => window.location.replace(link), []);

	return (
		<Head>
			<title>PaperPlane - {linkId}</title>
		</Head>
	);
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
	const parseQuery = (query: string | string[]) => (Array.isArray(query) ? query[0] : query);
	const linkId = parseQuery(ctx.query.id ?? "");
	const userId = parseQuery(ctx.query.userId ?? "");

	const linkData = await fetch<string>(`/${userId}/r/${linkId}`, {
		method: "GET",
	}).catch(() => ({ data: null }));

	if (!linkData.data)
		return {
			notFound: true,
		};

	return {
		props: {
			linkId,
			userId,
			link: linkData.data,
		},
	};
};

export default LinkPage;

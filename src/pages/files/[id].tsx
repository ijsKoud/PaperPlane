import { lookup } from "mime-types";
import type { NextPage, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import Head from "next/head";
import Link from "next/link";
import React from "react";
import prisma from "../../lib/prisma";

interface ServerSideProps {
	id: string;
	url: string;
	embed: {
		title: string;
		description: string;
		colour: string;
	};
}

const FileViewer: NextPage<ServerSideProps> = ({ id, url, embed }) => {
	const getPreviewItem = () => {
		const type = lookup(id);
		if (type) {
			const [fileType, extraType] = type.split("/");
			switch (fileType) {
				case "image":
					// eslint-disable-next-line @next/next/no-img-element
					return <img className="fileviewer-component" alt={url} src={url} />;
				case "video":
					return <video className="fileviewer-component" controls src={url} style={{ maxWidth: 107, maxHeight: 53 }} />;
				case "text":
				case "application":
					{
						switch (extraType) {
							case "plain":
							case "pdf":
								return <iframe className="fileviewer-component" src={url} style={{ backgroundColor: "white" }} />;
							default:
								break;
						}
					}
					break;
				default:
					break;
			}
		}

		return (
			<div className="fileviewer-no-preview">
				<i className="fas fa-file no-preview dashboard__table-preview" />
				<Link href={url}>
					<a target="_blank" rel="noopener noopener noreferrer">
						View raw
					</a>
				</Link>
			</div>
		);
	};

	return (
		<main>
			<Head>
				<title>PaperPlane - {id}</title>
				{embed.description && <meta property="og:description" content={embed.description} />}
				{embed.title && <meta property="og:title" content={embed.title} />}
				<meta property="theme-color" content={embed.colour} />
				<meta property="og:image" content={url} />
				<meta property="twitter:card" content="summary_large_image" />
			</Head>
			<div className="fileviewer-container">
				<h1>{id}</h1>
				<div className="center-items fileviewer">{getPreviewItem()}</div>
			</div>
		</main>
	);
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<ServerSideProps>> => {
	const user = await prisma.user.findFirst();
	const id = Array.isArray(ctx.query.id) ? ctx.query.id[0] : (ctx.query.id as string);

	const parse = (str: string) => str.replace(new RegExp("{file_title}", "g"), id).replace(new RegExp("{user}", "g"), user?.username ?? "unknown");

	return {
		props: {
			id,
			url: `${process.env.NEXT_PUBLIC_DOMAIN}/files/${id}?raw=true`,
			embed: {
				title: parse(user?.embedTitle ?? ""),
				colour: user?.embedColour ?? "#000000",
				description: parse(user?.embedDescription ?? "")
			}
		}
	};
};

export default FileViewer;

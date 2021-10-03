import Tippy from "@tippyjs/react";
import copy from "copy-to-clipboard";
import moment from "moment";
import { GetServerSidePropsContext, NextPage } from "next";
import Head from "next/head";
import React from "react";
import { fetch } from "../../lib/fetch";
import { FileStats } from "../../lib/types";
import { saveAs } from "file-saver";

interface Props {
	fileId: string;
	userId: string;
	file: FileStats & { raw: string };
}

const FilePage: NextPage<Props> = ({ fileId, userId, file }) => {
	const fileUrl = `${process.env.NEXT_PUBLIC_API}/${userId}/${fileId}`;

	const copyLink = () => copy(fileUrl);
	const downloadFile = () => saveAs(fileUrl, file.name);
	const getView = () => {
		const [type, sort] = file.type.split("/");

		switch (type) {
			case "image":
				return <img src={fileUrl} alt="" />;
			case "video":
				return <video controls src={fileUrl} />;
			case "application": {
				switch (sort) {
					case "pdf":
						return (
							<iframe src={fileUrl} style={{ width: "90vw", height: "90vh", border: "none" }} />
						);
					case "json":
						return (
							<div className="files-text">
								<p>{file.raw}</p>
							</div>
						);
					default:
						return (
							<div>
								<p>No preview available for file type {file.type}</p>
							</div>
						);
				}
			}
			case "text": {
				return (
					<div className="files-text">
						<p>{file.raw}</p>
					</div>
				);
			}
			default:
				return (
					<div>
						<p>No preview available for file type {file.type}</p>
					</div>
				);
		}
	};

	return (
		<>
			<Head>
				<title>PaperPlane - {fileId}</title>
				<meta name="twitter:image" content={fileUrl} />
				<meta name="og:image" content={fileUrl} />
			</Head>
			<main>
				<div className="file-buttons">
					<Tippy duration={5e2} content={<p>Open raw link</p>}>
						<i className="open fas fa-external-link-alt" onClick={() => window.open(fileUrl)} />
					</Tippy>
					<Tippy duration={5e2} content={<p>Download the file</p>}>
						<i className="download fas fa-cloud-download-alt" onClick={downloadFile} />
					</Tippy>
					<Tippy duration={5e2} content={<p>Copy the raw link</p>}>
						<i className="copy fas fa-link" onClick={copyLink} />
					</Tippy>
				</div>
				<div className="file-view">{getView()}</div>
			</main>
		</>
	);
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
	const parseQuery = (query: string | string[]) => (Array.isArray(query) ? query[0] : query);
	const fileId = parseQuery(ctx.query.id ?? "");
	const userId = parseQuery(ctx.query.userId ?? "");

	const fileData = await fetch<FileStats & { raw: string }>(`/${userId}/${fileId}?data=true`, {
		method: "GET",
	}).catch(() => ({ data: null }));

	if (!fileData.data)
		return {
			notFound: true,
		};

	return {
		props: {
			fileId,
			userId,
			file: { ...fileData.data, date: moment(fileData.data.date).format("DD/MM/YYYY HH:mm:ss") },
		},
	};
};

export default FilePage;

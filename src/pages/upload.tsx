import type { NextPage } from "next";
import React from "react";
import { FileUpload, LinkUpload } from "../components/pages/upload";
import Head from "next/head";

const Upload: NextPage = () => {
	return (
		<main className="upload">
			<Head>
				<title>PaperPlane - Upload</title>
			</Head>
			<FileUpload />
			<LinkUpload />
		</main>
	);
};

export default Upload;

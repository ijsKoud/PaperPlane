import type { NextPage } from "next";
import React from "react";
import { FileUpload, LinkUpload } from "../components/pages/upload";
import Head from "next/head";
import { useAuth } from "../lib/hooks/useAuth";
import Unauthorized from "../components/pages/errors/401";
import Loading from "../components/loading";

const Upload: NextPage = () => {
	const { loading, user } = useAuth();

	return (
		<main className="upload">
			<Head>
				<title>PaperPlane - Upload</title>
			</Head>
			{loading ? (
				<Loading />
			) : user ? (
				<>
					<FileUpload />
					<LinkUpload />
				</>
			) : (
				<Unauthorized />
			)}
		</main>
	);
};

export default Upload;

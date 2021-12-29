import type { NextPage } from "next";
import React from "react";
import Head from "next/head";
import PulseLoader from "../components/general/PulseLoader";
import { useAuth } from "../lib/hooks/useAuth";
import Unauthorized from "../components/general/Unauthorized";
import FileUpload from "../components/upload/FileUpload";
import LinkCreation from "../components/upload/LinkCreation";

const Upload: NextPage = () => {
	const { user, loading } = useAuth();

	return (
		<main className="center-items">
			<Head>
				<title>PaperPlane - Upload</title>
			</Head>
			{loading ? (
				<div className="center-items">
					<PulseLoader size={30} />
				</div>
			) : user ? (
				<>
					<FileUpload />
					<LinkCreation />
				</>
			) : (
				<Unauthorized />
			)}
		</main>
	);
};

export default Upload;

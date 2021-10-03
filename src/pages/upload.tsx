import type { NextPage } from "next";
import React from "react";
import { FileUpload } from "../components/pages/upload/";

const Upload: NextPage = () => {
	return (
		<main className="upload">
			<FileUpload />
			<div className="link-upload">
				<h1>Create shortlink</h1>
			</div>
		</main>
	);
};

export default Upload;

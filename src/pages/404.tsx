import { NextPage } from "next";
import Head from "next/head";
import React from "react";

const NotFound: NextPage<{ head: boolean }> = ({ head = true }) => {
	return (
		<>
			{head && (
				<Head>
					<title>404 - Not Found</title>
				</Head>
			)}
			<main style={{ width: "100vw", height: "100vh", display: "grid", placeItems: "center" }}>
				<img alt="" src="/assets/404.svg" style={{ width: "800px" }} />
				<h1 style={{ marginTop: "-10rem" }}>Page not found</h1>
			</main>
		</>
	);
};

export default NotFound;

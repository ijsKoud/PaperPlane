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
			<main className="error">
				<img src="/assets/404.svg" alt="" />
			</main>
		</>
	);
};

export default NotFound;

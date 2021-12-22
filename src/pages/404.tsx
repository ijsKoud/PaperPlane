import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import React from "react";

const NotFound: NextPage = () => {
	return (
		<main style={{ paddingTop: 0 }}>
			<Head>
				<title>404 - Not Found</title>
			</Head>
			<div className="error-container">
				<div className="error-items">
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img className="error-image" src="/assets/svg/lost.svg" alt="Lost illustration" />
					<h1>Looks like you are lost, let&apos;s go back shall we?</h1>
					<div className="error-buttons">
						<Link href="/dashboard">
							<a>
								<i className="fas fa-home" /> Home
							</a>
						</Link>
						<Link href="/">
							<a>
								<i className="fab fa-github" /> GitHub Repo
							</a>
						</Link>
					</div>
				</div>
			</div>
		</main>
	);
};

export default NotFound;

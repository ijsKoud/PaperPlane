import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import React from "react";

const Unauthorized: NextPage = () => {
	return (
		<main style={{ paddingTop: 0 }}>
			<Head>
				<title>401 - Unauthorized</title>
			</Head>
			<div className="error-container">
				<div className="error-items">
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img className="error-image" src="/assets/svg/police.svg" alt="Lost illustration" />
					<h1>You aren&apos;t allowed to be here, let&apos;s go back shall we?</h1>
					<div className="error-buttons" style={{ marginTop: "10px" }}>
						<Link href="/login">
							<a>
								<i className="fas fa-sign-in-alt" /> Login
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

export default Unauthorized;

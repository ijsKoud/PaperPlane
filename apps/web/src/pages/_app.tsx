import "../styles/globals.css";
import "../styles/output.css";
import "../styles/fontawesome.css";
import "react-toastify/dist/ReactToastify.min.css";

import SEO from "../next-seo.config";

import type { AppProps } from "next/app";
import { Poppins } from "@next/font/google";
import { SwrWrapper } from "@paperplane/swr";
import { ToastContainer } from "react-toastify";
import { DefaultSeo } from "next-seo";
import Head from "next/head";
import React from "react";
import { ThemeProvider } from "next-themes";

const poppins = Poppins({ weight: ["300", "400", "500", "600", "700", "800", "900"], subsets: ["latin"], display: "swap" });

const App = ({ Component, pageProps }: AppProps) => {
	const AppComponent = Component as React.FC;

	return (
		<ThemeProvider forcedTheme="dark" attribute="class">
			<SwrWrapper>
				<Head>
					<link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon.png" />
					<link rel="icon" type="image/png" sizes="32x32" href="/favicons/favicon-32x32.png" />
					<link rel="icon" type="image/png" sizes="16x16" href="/favicons/favicon-16x16.png" />
					<link rel="manifest" href="/favicons/site.webmanifest" />
					<link rel="mask-icon" href="/favicons/safari-pinned-tab.svg" color="#1f2021" />
					<link rel="shortcut icon" href="/favicons/favicon.ico" />
					<meta name="apple-mobile-web-app-title" content="PaperPlane" />
					<meta name="application-name" content="PaperPlane" />
					<meta name="msapplication-TileColor" content="#1f2021" />
					<meta name="msapplication-config" content="/favicons/browserconfig.xml" />
					<meta name="theme-color" content="#1f2021" />
				</Head>
				<DefaultSeo {...SEO} />
				<ToastContainer position="top-right" theme="dark" bodyStyle={poppins.style} />
				<main className={`bg-bg-dark min-h-screen min-w-full ${poppins.className}`}>
					<AppComponent {...pageProps} />
				</main>
			</SwrWrapper>
		</ThemeProvider>
	);
};

export default App;

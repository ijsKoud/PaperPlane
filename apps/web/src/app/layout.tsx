import "../styles/globals.css";
import "../styles/output.css";

import type React from "react";
import Providers from "./Providers";
import { Inter } from "@next/font/google";

const InterFont = Inter({ display: "swap", subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800", "900"] });

const RootLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
	return (
		<html suppressHydrationWarning>
			<head>
				<link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon.png" />
				<link rel="icon" type="image/png" sizes="32x32" href="/favicons/favicon-32x32.png" />
				<link rel="icon" type="image/png" sizes="16x16" href="/favicons/favicon-16x16.png" />
				<link rel="manifest" href="/favicons/site.webmanifest" />
				<link rel="mask-icon" href="/favicons/safari-pinned-tab.svg" color="#343434" />
				<link rel="shortcut icon" href="/favicons/favicon.ico" />
				<meta name="apple-mobile-web-app-title" content="PaperPlane" />
				<meta name="application-name" content="PaperPlane" />
				<meta name="msapplication-TileColor" content="#da532c" />
				<meta name="msapplication-config" content="/favicons/browserconfig.xml" />
				<meta name="theme-color" content="#343434" />
			</head>
			<body className="dark:bg-bg-dark bg-white" style={InterFont.style}>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
};

export default RootLayout;

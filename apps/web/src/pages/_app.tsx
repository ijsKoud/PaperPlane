import "../styles/globals.css";
import "../styles/output.css";
import "../styles/fontawesome.css";

import type { AppProps } from "next/app";
import { Poppins } from "@next/font/google";
import { SwrWrapper } from "@paperplane/swr";

const poppins = Poppins({ weight: ["300", "400", "500", "600", "700", "800", "900"], subsets: ["latin"], display: "swap" });

const App = ({ Component, pageProps }: AppProps) => {
	return (
		<SwrWrapper>
			<main className={`bg-bg-dark min-h-screen min-w-full ${poppins.className}`}>
				<Component {...pageProps} />
			</main>
		</SwrWrapper>
	);
};

export default App;

import "../styles/globals.css";

import type { AppProps } from "next/app";
import { Poppins } from "@next/font/google";

const poppins = Poppins({ weight: ["300", "400", "500", "600", "700", "800", "900"], subsets: ["latin"] });

const App = ({ Component, pageProps }: AppProps) => {
	return (
		<main className={`bg-bg-dark min-h-screen min-w-full ${poppins.className}`}>
			<Component {...pageProps} />
		</main>
	);
};

export default App;

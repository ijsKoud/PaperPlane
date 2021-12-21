import "../styles/index.scss";
import type { AppProps } from "next/app";

import Navbar from "../components/general/Navbar";

const App = ({ Component, pageProps }: AppProps) => {
	return (
		<>
			<Navbar />
			<Component {...pageProps} />
		</>
	);
};

export default App;

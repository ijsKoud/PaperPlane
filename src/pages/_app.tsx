import "../styles/index.scss";
import type { AppProps } from "next/app";

import Navbar from "../components/general/Navbar";
import { AnimatePresence } from "framer-motion";

const App = ({ Component, pageProps }: AppProps) => {
	return (
		<AnimatePresence exitBeforeEnter>
			<Navbar key="1" />
			<Component key="2" {...pageProps} />
		</AnimatePresence>
	);
};

export default App;

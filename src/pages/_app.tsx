import "../styles/index.scss";
import "tippy.js/dist/tippy.css";
import "react-notifications-component/dist/theme.css";

import type { AppProps } from "next/app";
import Navbar from "../components/general/Navbar";
import { AnimatePresence } from "framer-motion";
import ReactNotificationsComponent from "react-notifications-component";

const App = ({ Component, pageProps }: AppProps) => {
	return (
		<>
			<ReactNotificationsComponent />
			<Navbar />
			<AnimatePresence exitBeforeEnter>
				<Component {...pageProps} />
			</AnimatePresence>
		</>
	);
};

export default App;

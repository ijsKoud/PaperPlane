import "../styles/index.scss";
import "tippy.js/dist/tippy.css";
import "react-notifications-component/dist/theme.css";

import type { AppProps } from "next/app";
import Navbar from "../components/general/Navbar";
import { AnimatePresence, motion } from "framer-motion";
import ReactNotificationsComponent from "react-notifications-component";
import { defaultVariant } from "../lib/clientConstants";
import { ProvideAuth } from "../lib/hooks/useAuth";

const variants = {
	initial: { opacity: 0 },
	exit: { opacity: 0 },
	animate: {
		opacity: 1,
		...defaultVariant
	}
};

const App = ({ Component, pageProps, router }: AppProps) => {
	return (
		<ProvideAuth>
			<ReactNotificationsComponent />
			<Navbar />
			<AnimatePresence exitBeforeEnter>
				<motion.div key={router.route} variants={variants} initial="initial" animate="animate" exit="exit">
					<Component {...pageProps} />
				</motion.div>
			</AnimatePresence>
		</ProvideAuth>
	);
};

export default App;

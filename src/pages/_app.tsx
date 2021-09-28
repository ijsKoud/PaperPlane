import "../styles/index.scss";
import "tippy.js/dist/tippy.css";
import "react-notifications-component/dist/theme.css";

import type { AppProps } from "next/app";
import Navbar from "../components/navbar";
import { ProvideAuth } from "../lib/hooks/useAuth";
import { CookiesProvider } from "react-cookie";
import NotificationsComponent from "react-notifications-component";
import { AnimatePresence, motion } from "framer-motion";

const variants = {
	initial: { opacity: 0 },
	exit: { opacity: 0 },
	animate: {
		opacity: 1,
		transition: {
			duration: 0.5,
			ease: [0.6, -0.05, 0.01, 0.99],
		},
	},
};

const App = ({ Component, pageProps, router }: AppProps) => {
	return (
		<>
			<NotificationsComponent />
			<CookiesProvider>
				<ProvideAuth>
					<Navbar />
					<AnimatePresence exitBeforeEnter>
						<motion.div
							key={router.route}
							variants={variants}
							initial="initial"
							animate="animate"
							exit="exit">
							<Component {...pageProps} />
						</motion.div>
					</AnimatePresence>
				</ProvideAuth>
			</CookiesProvider>
		</>
	);
};

export default App;

import "../styles/index.scss";
import "tippy.js/dist/tippy.css";
import "react-toastify/dist/ReactToastify.css";

import { ToastContainer, toast } from "react-toastify";
import { ProvideAuth } from "../lib/hooks/useAuth";
import type { AppProps } from "next/app";

const App = ({ Component, pageProps }: AppProps) => {
	return (
		<ProvideAuth>
			<ToastContainer position={toast.POSITION.TOP_RIGHT} theme="dark" style={{ zIndex: 99999 }} />
			<Component {...pageProps} />
		</ProvideAuth>
	);
};

export default App;

import "../styles/index.scss";
import { ProvideAuth } from "../lib/hooks/useAuth";
import type { AppProps } from "next/app";

const App = ({ Component, pageProps }: AppProps) => {
	return (
		<ProvideAuth>
			<Component {...pageProps} />
		</ProvideAuth>
	);
};

export default App;

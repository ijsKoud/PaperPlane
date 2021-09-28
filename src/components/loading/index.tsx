import { ThreeDots } from "@agney/react-loading";
import React from "react";

const Loading: React.FC = () => {
	return (
		<main style={{ display: "grid", placeItems: "center", height: "100vh", width: "100vw" }}>
			<ThreeDots style={{ width: "150px" }} />
		</main>
	);
};

export default Loading;

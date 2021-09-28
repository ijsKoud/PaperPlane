import React from "react";
import Head from "next/head";

const Unauthorized: React.FC = () => {
	return (
		<>
			<Head>
				<title>401 - Unauthorized</title>
			</Head>
			<main className="error">
				<img src="/assets/401.svg" alt="" />
			</main>
		</>
	);
};

export default Unauthorized;

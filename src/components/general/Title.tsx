import Head from "next/head";
import React from "react";
import type { FC } from "../../lib/types";

const Title: FC = ({ children }) => {
	return (
		<Head>
			<title>{children}</title>
		</Head>
	);
};

export default Title;

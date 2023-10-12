"use client";

import Markdown from "@paperplane/markdown";
import { useTheme } from "next-themes";
import React from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark, atomOneLight } from "react-syntax-highlighter/dist/esm/styles/hljs";

const Highlighter = SyntaxHighlighter as unknown as React.FC<any>;

export interface PasteBinProps {
	data: string;
	highlight: string;
}

const PasteBin: React.FC<PasteBinProps> = ({ data, highlight }) => {
	const { theme } = useTheme();

	return highlight === "markdown" ? (
		<Markdown>{data}</Markdown>
	) : (
		<Highlighter style={theme === "light" ? atomOneLight : atomOneDark} language={highlight} showLineNumbers>
			{data}
		</Highlighter>
	);
};

export default PasteBin;

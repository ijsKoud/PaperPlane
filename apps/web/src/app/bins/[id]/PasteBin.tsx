"use client";

import Markdown from "@paperplane/markdown";
import { useTheme } from "next-themes";
import React from "react";
import SyntaxHighlighter from "react-syntax-highlighter/dist/cjs/default-highlight";
import { atomOneDark, atomOneLight } from "react-syntax-highlighter/dist/esm/styles/hljs";

export interface PasteBinProps {
	data: string;
	highlight: string;
}

const PasteBin: React.FC<PasteBinProps> = ({ data, highlight }) => {
	const { theme } = useTheme();

	return highlight === "markdown" ? (
		<Markdown>{data}</Markdown>
	) : (
		<SyntaxHighlighter style={theme === "light" ? atomOneLight : atomOneDark} language={highlight} showLineNumbers>
			{data}
		</SyntaxHighlighter>
	);
};

export default PasteBin;

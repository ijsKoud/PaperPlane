import type React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm, { Options } from "remark-gfm";

interface Props {
	children: string;
}

const Markdown: React.FC<Props> = ({ children }) => {
	const remarkGfmOptions: Options = {
		singleTilde: true
	};

	return (
		<ReactMarkdown
			remarkPlugins={[[remarkGfm, remarkGfmOptions]]}
			components={{
				h1: ({ node, inline, children, ...props }) => (
					<h1 className="text-3xl border-b border-white-200 mb-4" {...props}>
						{children}
					</h1>
				),
				h2: ({ node, inline, children, ...props }) => (
					<h2 className="text-2xl border-b border-white-200 mb-4" {...props}>
						{children}
					</h2>
				),
				h3: ({ node, inline, children, ...props }) => (
					<h3 className="text-xl border-b border-white-200 mb-4" {...props}>
						{children}
					</h3>
				),
				h4: ({ node, inline, children, ...props }) => (
					<h4 className="text-lg border-b border-white-200 mb-4" {...props}>
						{children}
					</h4>
				),
				h5: ({ node, inline, children, ...props }) => (
					<h5 className="text-lg border-b border-white-200 mb-4" {...props}>
						{children}
					</h5>
				),
				h6: ({ node, inline, children, ...props }) => (
					<h6 className="text-lg border-b border-white-200 mb-4" {...props}>
						{children}
					</h6>
				),
				li: ({ node, inline, children, ...props }) => (
					<li className="text-base" {...props}>
						{children}
					</li>
				),
				ol: ({ node, inline, children, ...props }) => (
					<ol className="pl-5 list-disc" {...props}>
						{children}
					</ol>
				),
				ul: ({ node, inline, children, ...props }) => (
					<ul className="pl-5 list-disc" {...props}>
						{children}
					</ul>
				)
			}}
		>
			{children}
		</ReactMarkdown>
	);
};

export default Markdown;

import React, { JSXElementConstructor, ReactElement } from "react";
import Tippy from "@tippyjs/react";

interface Props {
	content: string;
	children: ReactElement<any, string | JSXElementConstructor<any>> | undefined;
}

const ToolTip: React.FC<Props> = ({ content, children }) => {
	return (
		<Tippy
			className="discord-theme"
			content={content}
			theme="discord"
			arrow
			inertia
			animation="discord-anim"
			duration={[100, 100]}
			hideOnClick={false}
		>
			{children}
		</Tippy>
	);
};

export default ToolTip;

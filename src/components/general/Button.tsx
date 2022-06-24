import Link from "next/link";
import React from "react";
import type { FC } from "../../lib/types";

interface Props {
	type: "link";
	style: "black";

	text: string;
	url: string;
	external?: boolean;
}

const Button: FC<Props> = ({ text, url, style }) => {
	const className = `button button-${style}`;

	return (
		<Link href={url}>
			<a className={className}>{text}</a>
		</Link>
	);
};

export default Button;

import Link from "next/link";
import React from "react";
import type { FC } from "../../lib/types";

interface LinkProps {
	type: "link";
	style: ButtonStyle;

	text?: string;
	url: string;

	newWindow?: boolean;
	external?: boolean;
}

interface ButtonProps {
	style: ButtonStyle;
	type: "button";

	text?: string;
	onClick: () => void;
}

type ButtonStyle = "black";
type Props = ButtonProps | LinkProps;

const Button: FC<Props> = (props) => {
	const { type, style, children, text } = props;
	const className = `button button-${style}`;

	if (type === "link") {
		const { url, newWindow, external } = props;

		return (
			<Link href={url}>
				<a target={newWindow ? "_blank" : "_self"} rel="noopener noreferrer" className={className}>
					{text ?? children} {external && <i className="fa-solid fa-arrow-up-right-from-square" />}
				</a>
			</Link>
		);
	}

	const { onClick } = props;
	return (
		<button className={className} onClick={onClick}>
			{text ?? children}
		</button>
	);
};

export default Button;

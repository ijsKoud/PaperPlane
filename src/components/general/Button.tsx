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
	onClick?: () => void;
}

interface ButtonProps {
	style: ButtonStyle;
	type: "button";

	text?: string;
	onClick: () => void;
}

type ButtonStyle = "black" | "grey" | "blurple" | "yellow" | "danger" | "success" | "text";
type Props = ButtonProps | LinkProps;

const Button: FC<Props> = (props) => {
	const { type, style, children, text, onClick } = props;
	const className = `button button-${style}`;

	if (type === "link") {
		const { url, newWindow, external } = props;

		return (
			<Link href={url}>
				<a onClick={onClick} target={newWindow ? "_blank" : "_self"} rel="noopener noreferrer" className={className}>
					{text ?? children}
					{external && <i className="fa-solid fa-arrow-up-right-from-square" />}
				</a>
			</Link>
		);
	}

	return (
		<button className={className} onClick={onClick}>
			{text ?? children}
		</button>
	);
};

export default Button;

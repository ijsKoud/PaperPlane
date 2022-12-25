import type React from "react";
import Link from "next/link";

interface ButtonProps {
	type: "button";
	onClick?: () => void;
	color: Colors;
}

interface LinkProps {
	type: "link";
	href: string;
	target?: string;
	color: Colors;
}

type Colors = "primary" | "secondary" | "tertiary" | "white";
type AllPropsWithColor = ButtonProps | LinkProps;

export type AllProps = Omit<AllPropsWithColor, "color">;

const Button: React.FC<React.PropsWithChildren<AllPropsWithColor>> = (props) => {
	const El = (props.type === "link" ? Link : (props: any) => <button {...props} />) as React.FC<any>;

	return (
		<El
			className={`bg-${props.color}-400 border border-${props.color}-800 text-white px-4 py-2 rounded-xl text-base hover:bg-${props.color}-600 hover:border-${props.color} transition-colors`}
			{...props}
		/>
	);
};

export default Button;

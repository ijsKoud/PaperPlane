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

type Colors = keyof typeof Colors;
type AllPropsWithColor = ButtonProps | LinkProps;

export type AllProps = Omit<AllPropsWithColor, "color">;

const Colors = {
	primary: {
		bg: "bg-primary-400",
		border: "border-primary-800",
		hoverBg: "hover:bg-primary-600",
		hoverBorder: "hover:border-primary"
	},
	secondary: {
		bg: "bg-secondary-400",
		border: "border-secondary-800",
		hoverBg: "hover:bg-secondary-600",
		hoverBorder: "hover:border-secondary"
	},
	tertiary: {
		bg: "bg-highlight-400",
		border: "border-highlight-800",
		hoverBg: "hover:bg-highlight-600",
		hoverBorder: "hover:border-highlight"
	},
	white: {
		bg: "bg-white-400",
		border: "border-white-800",
		hoverBg: "hover:bg-white-600",
		hoverBorder: "hover:border-white"
	}
};

const Button: React.FC<React.PropsWithChildren<AllPropsWithColor>> = (props) => {
	const El = (props.type === "link" ? Link : (props: any) => <button {...props} />) as React.FC<any>;
	const colors = Colors[props.color];

	return (
		<El
			className={`${colors.bg} border ${colors.border} text-white px-4 py-2 rounded-xl text-base ${colors.hoverBg} ${colors.hoverBorder} transition-colors`}
			{...props}
		/>
	);
};

export default Button;

import type React from "react";
import Link from "next/link";

interface ButtonPropsColor {
	type: "button";
	onClick?: () => void;
	color: Colors;
	extra?: string;
}

interface LinkPropsColor {
	type: "link";
	href: string;
	target?: string;
	onClick?: () => void;
	color: Colors;
	extra?: string;
}

type Colors = keyof typeof Colors;
type AllPropsWithColor = ButtonPropsColor | LinkPropsColor;

export type LinkProps = Omit<LinkPropsColor, "color">;
export type ButtonProps = Omit<ButtonPropsColor, "color">;
export type AllProps = LinkProps | ButtonProps;

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
	},
	transparent: {
		bg: "bg-transparent",
		border: "border-transparent border-none",
		hoverBg: "hover:text-white-600",
		hoverBorder: "!p-[0px]"
	},
	danger: {
		bg: "bg-red-400",
		border: "border-red-800",
		hoverBg: "hover:bg-red-600",
		hoverBorder: "hover:border-red"
	},
	success: {
		bg: "bg-green-400",
		border: "border-green-800",
		hoverBg: "hover:bg-green-600",
		hoverBorder: "hover:border-green"
	}
};

const Button: React.FC<React.PropsWithChildren<AllPropsWithColor>> = (props) => {
	const El = (props.type === "link" ? Link : (props: any) => <button {...props} />) as React.FC<any>;
	const colors = Colors[props.color];

	return (
		<El
			className={`${props.extra ?? ""} ${colors.bg} border ${colors.border} text-white px-4 py-2 rounded-xl text-base ${colors.hoverBg} ${
				colors.hoverBorder
			} transition-colors`}
			{...props}
		/>
	);
};

export default Button;

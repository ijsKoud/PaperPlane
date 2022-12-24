import type React from "react";
import Link from "next/link";

interface ButtonProps {
	type: "button";
	onClick?: () => void;
}

interface LinkProps {
	type: "link";
	href: string;
	target?: string;
}

type AllProps = ButtonProps | LinkProps;

export const PrimaryButton: React.FC<React.PropsWithChildren<AllProps>> = (props) => {
	const El = (props.type === "link" ? Link : (props: any) => <button {...props} />) as React.FC<any>;

	return (
		<El
			className="bg-primary-400 border border-primary-800 text-white px-4 py-2 rounded-xl text-base hover:bg-primary-600 hover:border-primary transition-colors"
			{...props}
		/>
	);
};

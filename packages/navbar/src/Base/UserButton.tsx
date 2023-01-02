import type React from "react";
import Link from "next/link";

interface ButtonProps {
	type: "button";
	onClick?: () => void;
	extra?: string;
}

interface LinkProps {
	type: "link";
	href: string;
	target?: string;
	extra?: string;
}

type AllProps = ButtonProps | LinkProps;

const UserButton: React.FC<React.PropsWithChildren<AllProps>> = (props) => {
	const El = (props.type === "link" ? Link : (props: any) => <button {...props} />) as React.FC<any>;

	return (
		<El className="bg-white-200 text-white w-9 h-9 rounded-full text-base hover:bg-white-400 transition-colors" {...props}>
			<i className="fa-solid fa-user" />
		</El>
	);
};

export default UserButton;

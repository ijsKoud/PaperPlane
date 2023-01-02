import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

interface Props {
	href: string;
}

export const DashboardNavButton: React.FC<React.PropsWithChildren<Props>> = ({ children, href }) => {
	const [active, setActive] = useState(false);
	const { pathname } = useRouter();

	useEffect(() => {
		setActive(pathname === href);
	}, []);

	return (
		<Link
			href={href}
			className={`cursor-pointer relative px-4 py-1 mb-2 rounded-lg text-white-600 hover:bg-white-200 hover:text-white transition-colors ${
				active ? "!text-white before:absolute before:-bottom-2 before:border before:h-0 before:left-2 before:right-2 before:block" : ""
			}`}
		>
			{children}
		</Link>
	);
};

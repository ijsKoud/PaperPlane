import type React from "react";

export interface TableHeadProps {
	position: keyof typeof Positions;
	className?: string;
}

const Positions = {
	left: "text-left",
	right: "text-right",
	center: "text-center"
};

export const TableHead: React.FC<React.PropsWithChildren<TableHeadProps>> = ({ position, className, children }) => {
	return <th className={`text-lg ${className} ${Positions[position]}`}>{children}</th>;
};

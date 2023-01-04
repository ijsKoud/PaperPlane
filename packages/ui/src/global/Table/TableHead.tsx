import type React from "react";

export interface TableHeadProps {
	position: keyof typeof Positions;
}

const Positions = {
	left: "text-left",
	right: "text-right",
	center: "text-center"
};

export const TableHead: React.FC<React.PropsWithChildren<TableHeadProps>> = ({ position, children }) => {
	return <th className={`text-lg ${Positions[position]}`}>{children}</th>;
};

import type React from "react";

interface Props {
	className?: string;
}

export const TableEntry: React.FC<React.PropsWithChildren<Props>> = ({ className, children }) => {
	return <tr className={`even:bg-white-200 text-base font-light ${className}`}>{children}</tr>;
};

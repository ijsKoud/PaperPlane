import type React from "react";
import { TableHead, TableHeadProps } from "./TableHead";

interface Props {
	className: string;
	headClassName?: string;
	headPosition: TableHeadProps["position"];
	heads: string[];
	children: React.ReactNode[];
}

export const Table: React.FC<Props> = ({ className, headClassName, heads, headPosition, children }) => {
	return (
		<table className={className}>
			<thead>
				<tr>
					{heads.map((head, index) => (
						<TableHead key={index} position={headPosition} className={headClassName}>
							{head}
						</TableHead>
					))}
				</tr>
			</thead>
			<tbody>{...children}</tbody>
		</table>
	);
};

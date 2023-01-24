import type React from "react";
import { TableHead, TableHeadProps } from "./TableHead";

interface Props {
	className: string;
	headClassName?: string;
	headPosition: TableHeadProps["position"];
	heads: string[];
	children: React.ReactNode[];
	colgroups?: (number | string)[];
}

export const Table: React.FC<Props> = ({ className, headClassName, heads, headPosition, children, colgroups }) => {
	return (
		<table className={className}>
			{colgroups && (
				<colgroup>
					{colgroups.map((col, key) => (
						<col span={1} key={key} style={{ width: col, minWidth: col }} />
					))}
				</colgroup>
			)}
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

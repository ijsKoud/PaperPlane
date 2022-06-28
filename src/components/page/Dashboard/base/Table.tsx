import React from "react";
import type { FC } from "../../../../lib/types";

interface Props {
	columns: number[];
	keys: string[];
}

const Table: FC<Props> = ({ children, columns, keys }) => {
	return (
		<table className="dashboard-table">
			<colgroup>
				{columns.map((width, key) => (
					<col span={1} key={key} style={{ width }} />
				))}
			</colgroup>
			<thead className="dashboard-table-head">
				<tr>
					{keys.map((key) => (
						<th key={key}>{key}</th>
					))}
				</tr>
			</thead>
			<tbody className="dashboard-table-content">{children}</tbody>
		</table>
	);
};

export default Table;

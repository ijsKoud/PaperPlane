import React from "react";

interface Props {
	listItems: string[];
}

const Table: React.FC<Props> = ({ listItems, children }) => {
	return (
		<div className="dashboard-table-component">
			<table>
				<thead>
					<tr>
						{listItems.map((item, i) => (
							<th key={i}>{item}</th>
						))}
					</tr>
				</thead>
				<tbody>{children}</tbody>
			</table>
		</div>
	);
};

export default Table;

import React from "react";
import type { Stats } from "../../lib";

interface Props {
	stats: Stats;
}

const Statistics: React.FC<Props> = ({ stats }) => {
	return (
		<div className="dashboard-stats">
			<h1 className="dashboard__stats-title">Stats</h1>
			<div className="dashboard__stats-items">
				<div className="dashboard__stats-item">
					<h2>Files</h2>
					<p>{stats.files.size}</p>
				</div>
				<div className="dashboard__stats-item">
					<h2>Links</h2>
					<p>{stats.links}</p>
				</div>
				<div className="dashboard__stats-item">
					<h2>Total Size</h2>
					<p>{stats.files.bytes}</p>
				</div>
			</div>
		</div>
	);
};

export default Statistics;

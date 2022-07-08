import React from "react";
import { useAuth } from "../../../lib/hooks/useAuth";
import type { FC } from "../../../lib/types";

const StatsContainer: FC = () => {
	const { stats } = useAuth();

	return (
		<div className="dashboard-stats">
			<h1>Statistics</h1>
			<div className="dashboard-stats-content">
				<div>
					<h2>Files</h2>
					<p>{stats.files.size}</p>
				</div>
				<div>
					<h2>Storage</h2>
					<p>{stats.files.bytes}</p>
				</div>
				<div>
					<h2>Links</h2>
					<p>{stats.links}</p>
				</div>
			</div>
		</div>
	);
};

export default StatsContainer;

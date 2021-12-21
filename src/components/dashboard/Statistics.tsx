import React, { useEffect, useState } from "react";
import { fetch, getCancelToken, Stats } from "../../lib";

const Statistics: React.FC = () => {
	const [stats, setStats] = useState<Stats>({ files: { size: 0, bytes: "0 kB" }, links: 0 });

	useEffect(() => {
		const { cancel, token } = getCancelToken();
		fetch<Stats>("/api/stats", token)
			.then((res) => setStats(res.data))
			.catch(() => void 0);

		return () => cancel();
	}, []);

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

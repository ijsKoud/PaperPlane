import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { fetch, getCancelToken } from "../../../lib/fetch";
import type { FC, StatsApi } from "../../../lib/types";
import Loader from "../../general/Loader";

const StatsContainer: FC = () => {
	const [stats, setStats] = useState<StatsApi>();

	useEffect(() => {
		const token = getCancelToken();
		fetch<StatsApi>("/api/dashboard/stats", token.token)
			.then((res) => setStats(res.data))
			.catch(() => toast.error("Unable to load the files list, please try again later."));

		return () => token.cancel("cancelled");
	}, []);

	return (
		<div className="dashboard-stats">
			<h1>Statistics</h1>
			<div className="dashboard-stats-content">
				{stats ? (
					<>
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
					</>
				) : (
					<Loader size={30} />
				)}
			</div>
		</div>
	);
};

export default StatsContainer;

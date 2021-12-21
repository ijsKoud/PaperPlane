import type { NextPage } from "next";
import React, { useEffect, useState } from "react";

import Statistics from "../components/dashboard/Statistics";
import FileTable from "../components/dashboard/FileTable";
import { fetch, getCancelToken, Stats } from "../lib";
import type { CancelToken } from "axios";

const Dashboard: NextPage = () => {
	const [stats, setStats] = useState<Stats>({
		files: { bytes: "0.0 B", size: 0 },
		links: 0
	});

	const fetchStats = (token?: CancelToken) => {
		fetch<Stats>("/stats/", token)
			.then((res) => setStats(res.data))
			.catch(() => void 0);
	};

	useEffect(() => {
		const { token, cancel } = getCancelToken();
		fetchStats(token);

		return () => cancel("Cancelled");
	}, []);

	return (
		<main>
			<Statistics stats={stats} />
			<FileTable fetchStats={fetchStats} />
		</main>
	);
};

export default Dashboard;

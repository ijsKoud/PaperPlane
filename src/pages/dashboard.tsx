import axios, { CancelToken } from "axios";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import Loading from "../components/loading";
import { fetch } from "../lib/fetch";
import { useAuth } from "../lib/hooks/useAuth";
import { Stats } from "../lib/types";
import DashboardFiles from "../components/pages/dashboard/files";
import DashboardLinks from "../components/pages/dashboard/links";

const Dashboard: NextPage = () => {
	const { loading, user } = useAuth();
	const [stats, setStats] = useState<Stats>({
		files: { bytes: "0.0 B", size: 0 },
		links: 0,
		users: 1,
	});

	const fetchStats = (token?: CancelToken) => {
		fetch("/stats/", {
			withCredentials: true,
			cancelToken: token,
		})
			.then((res) => setStats(res.data))
			.catch(() => void 0);
	};

	useEffect(() => {
		const { token, cancel } = axios.CancelToken.source();
		fetchStats(token);

		return () => cancel("Cancelled");
	}, []);

	return loading ? (
		<Loading />
	) : (
		<main className="dashboard">
			<h1 className="dashboard-title">Welcome back {user?.username}</h1>
			<div className="dashboard-stats">
				<h1 className="dashboard__stats-title">Stats</h1>
				<div className="dashboard__stats-items">
					<div className="dashboard__stats-item">
						<h2>Files</h2>
						<p>{stats.files.size}</p>
					</div>
					<div className="dashboard__stats-item">
						<h2>Total Size</h2>
						<p>{stats.files.bytes}</p>
					</div>
					<div className="dashboard__stats-item">
						<h2>Links</h2>
						<p>{stats.links}</p>
					</div>
					<div className="dashboard__stats-item">
						<h2>Users</h2>
						<p>{stats.users}</p>
					</div>
				</div>
			</div>
			<DashboardFiles user={user!} fetchStats={fetchStats} />
			<DashboardLinks user={user!} fetchStats={fetchStats} />
		</main>
	);
};

export default Dashboard;

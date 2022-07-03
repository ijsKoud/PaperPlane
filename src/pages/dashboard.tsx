import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Loader from "../components/general/Loader";
import Title from "../components/general/Title";
import Dashboard from "../components/page/Dashboard";
import { useAuth } from "../lib/hooks/useAuth";

const Home: NextPage = () => {
	const { user, loading: userLoading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!user && !userLoading) void router.push("/login");
	}, [user, userLoading]);

	const getProtocol = () => {
		const env = process.env.NEXT_PUBLIC_SECURE;
		if (env && env === "false") return "http://";

		return "https://";
	};

	return (
		<>
			<Title>Paperplane - Dashboard</Title>
			{userLoading ? (
				<main className="home-page-container">
					<Loader size={20} />
				</main>
			) : (
				<main className="home-page-container" style={{ minHeight: "unset" }}>
					<Dashboard protocol={getProtocol()} />
				</main>
			)}
		</>
	);
};

export default Home;

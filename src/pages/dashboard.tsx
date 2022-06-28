import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Loader from "../components/general/Loader";
import Dashboard from "../components/page/Dashboard";
import { useAuth } from "../lib/hooks/useAuth";

const Home: NextPage = () => {
	const [protocol, setProtocol] = useState("http");
	const { user, loading: userLoading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!user && !userLoading) void router.push("/login");
	}, [user, userLoading]);

	useEffect(() => {
		setProtocol(window.location.protocol);
	}, []);

	return (
		<main className="home-page-container" style={{ height: "unset" }}>
			{userLoading ? <Loader size={20} /> : <Dashboard protocol={protocol} />}
		</main>
	);
};

export default Home;

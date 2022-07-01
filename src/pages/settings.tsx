import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Loader from "../components/general/Loader";
import Navbar from "../components/general/Navbar";
import EmbedSettings from "../components/page/Settings/Embed";
import { useAuth } from "../lib/hooks/useAuth";

const Home: NextPage = () => {
	const { user, loading: userLoading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!user && !userLoading) void router.push("/login");
	}, [user, userLoading]);

	return userLoading ? (
		<main className="home-page-container">
			<Loader size={20} />
		</main>
	) : (
		<main className="home-page-container" style={{ minHeight: "unset" }}>
			<Navbar />
			<EmbedSettings />
		</main>
	);
};

export default Home;

import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Loader from "../components/general/Loader";
import Navbar from "../components/general/Navbar";
import { useAuth } from "../lib/hooks/useAuth";

const Home: NextPage = () => {
	const { user, loading: userLoading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!user && !userLoading) void router.push("/login");
	}, [user, userLoading]);

	return (
		<main className="home-page-container">
			{userLoading ? (
				<Loader size={20} />
			) : (
				<>
					<Navbar />
				</>
			)}
		</main>
	);
};

export default Home;

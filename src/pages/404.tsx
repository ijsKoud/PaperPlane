import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";

const NotFound: NextPage = () => {
	const router = useRouter();

	useEffect(() => {
		void router.push("/");
	}, []);

	return <div></div>;
};

export default NotFound;

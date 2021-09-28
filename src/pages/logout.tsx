import type { NextPage } from "next";
import { useCookies } from "react-cookie";
import React, { useEffect } from "react";
import { fetch } from "../lib/fetch";
import { useRouter } from "next/router";
import { useAuth } from "../lib/hooks/useAuth";
import Loading from "../components/loading";

const Login: NextPage = () => {
	const [, , removeCookie] = useCookies(["session"]);
	const auth = useAuth();
	const router = useRouter();

	useEffect(() => {
		fetch("/auth/logout", {
			method: "DELETE",
			withCredentials: true,
		})
			.then(() => removeCookie("session"))
			.then(() => {
				auth.fetch(true);
				router.push("/");
			})
			.catch(() => router.push("/"));
	}, []);

	return <Loading />;
};

export default Login;

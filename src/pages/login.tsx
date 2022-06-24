import type { AxiosError } from "axios";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { fetch } from "../lib/fetch";
import { useAuth } from "../lib/hooks/useAuth";
import type { ApiError, LoginCreds } from "../lib/types";

const Login: NextPage = () => {
	const { user, fetch: userFetch } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (user) void router.replace("/dashboard");
	}, [user]);

	// const onSubmit = async (data: LoginCreds) => {
	// 	try {
	// 		const token = await fetch<{ token: string }>("/api/auth/login", undefined, {
	// 			method: "POST",
	// 			data
	// 		});
	// 		localStorage.setItem("PAPERPLANE_AUTH", token.data.token);
	// 		userFetch();
	// 	} catch (error) {
	// 		if (!error || typeof error !== "object" || !("isAxiosError" in error)) return;

	// 		const err = error as AxiosError<ApiError>;
	// 		console.error("Error while logging in", `${err.response?.data.message ?? "Unknown error, please try again later!"}`);
	// 	}
	// };

	return (
		<main className="home-page-container">
			<div className="home-content">
				<h1>Login</h1>
			</div>
		</main>
	);
};

export default Login;

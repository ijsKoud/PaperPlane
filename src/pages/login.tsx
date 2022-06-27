import type { AxiosError } from "axios";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { toast } from "react-toastify";
import Form from "../components/page/login/Form";
import { fetch } from "../lib/fetch";
import { useAuth } from "../lib/hooks/useAuth";
import type { ApiError, LoginCreds } from "../lib/types";

const Login: NextPage = () => {
	const { user, fetch: userFetch } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (user) {
			toast.success(`Login Successful! Welcome back, ${user.username}.`);
			void router.replace("/dashboard");
		}
	}, [user]);

	const onSubmit = async (data: LoginCreds) => {
		try {
			const token = await fetch<{ token: string }>("/api/auth/login", undefined, {
				method: "POST",
				data
			});
			localStorage.setItem("PAPERPLANE_AUTH", token.data.token);
			userFetch();
		} catch (error) {
			if (!error || typeof error !== "object" || !("isAxiosError" in error)) return;

			const err = error as AxiosError<ApiError>;
			const errMsg = err.response?.data.message ?? "Unknown error, please try again later!";

			toast.error(`LOGIN ERROR: ${errMsg}`);
			console.error("Error while logging in", errMsg);
		}
	};

	return (
		<main className="login">
			<Head>
				<title>PaperPlane - Login</title>
			</Head>
			<Form onSubmit={onSubmit} />
		</main>
	);
};

export default Login;

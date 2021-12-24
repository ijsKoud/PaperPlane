import type { NextPage } from "next";
import React, { useEffect } from "react";
import Head from "next/head";
import { useAuth } from "../lib/hooks/useAuth";
import { useRouter } from "next/router";
import { ApiError, fetch, LoginCreds } from "../lib";

import CredentialForm from "../components/login/CredentialForm";
import type { AxiosError } from "axios";
import { alert } from "../lib/notifications";

const Login: NextPage = () => {
	const { user, fetch: userFetch } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (user) void router.replace("/dashboard");
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
			alert("Error while logging in", `${err.response?.data.message ?? "Unknown error, please try again later!"}`);
		}
	};

	return (
		<main className="login">
			<Head>
				<title>PaperPlane - Login</title>
			</Head>
			<CredentialForm onSubmit={onSubmit} />
		</main>
	);
};

export default Login;

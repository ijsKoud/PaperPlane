import type { NextPage } from "next";
import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useAuth } from "../lib/hooks/useAuth";
import { useRouter } from "next/router";
import { ApiError, fetch, LoginCreds } from "../lib";

import CredentialForm from "../components/login/CredentialForm";
import type { AxiosError } from "axios";
import { alert } from "../lib/notifications";

const Dashboard: NextPage = () => {
	const [userData, setUserData] = useState<LoginCreds | null>(null);
	const { user, fetch: userFetch } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (user) void router.replace("/dashboard");
	}, [user]);

	const onSubmit = async (data: LoginCreds) => {
		const has2faEnabled = await fetch<{ enabled: boolean }>("/api/auth/2fa", undefined, {
			method: "POST",
			data: { username: data.username }
		}).catch(() => ({ data: { enabled: false } }));
		if (has2faEnabled.data.enabled) {
			setUserData(data);
			return;
		}

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

export default Dashboard;

import type { AxiosError } from "axios";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { toast } from "react-toastify";
import Form from "../components/page/login/Form";
import { fetch } from "../lib/fetch";
import { useAuth } from "../lib/hooks/useAuth";
import type { ApiError, LoginCreds } from "../lib/types";
import { setCookies } from "cookies-next";
import Title from "../components/general/Title";

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
			setCookies("PAPERPLANE_AUTH", token.data.token, { maxAge: 31556952e3 });
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
			<Title>Paperplane - Login</Title>
			<Form onSubmit={onSubmit} />
		</main>
	);
};

export default Login;

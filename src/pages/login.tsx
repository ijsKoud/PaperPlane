import type { NextPage } from "next";
import React, { useEffect } from "react";
import Head from "next/head";
import { useAuth } from "../lib/hooks/useAuth";
import { useRouter } from "next/router";
import type { LoginCreds } from "../lib";

import CredentialForm from "../components/login/CredentialForm";

const Dashboard: NextPage = () => {
	const { user, fetch } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (user) void router.replace("/dashboard");
	}, [user]);

	const onSubmit = (data: LoginCreds) => {
		void 0;
		fetch();
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

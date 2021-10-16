import { NextPage } from "next";
import Head from "next/head";
import React from "react";
import Loading from "../components/loading";
import Unauthorized from "../components/pages/errors/401";
import ConfigDownloads from "../components/pages/settings/configDownloads";
import UserSettings from "../components/pages/settings/userSettings";
import { useAuth } from "../lib/hooks/useAuth";

const Settings: NextPage = () => {
	const { loading, user } = useAuth();

	return (
		<>
			<Head>
				<title>PaperPlane - Settings</title>
			</Head>
			{loading ? (
				<Loading />
			) : user ? (
				<main className="settings">
					<UserSettings />
					<ConfigDownloads />
				</main>
			) : (
				<Unauthorized />
			)}
		</>
	);
};

export default Settings;

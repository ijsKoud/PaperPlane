import type { NextPage } from "next";
import React from "react";
import Head from "next/head";
import PulseLoader from "../components/general/PulseLoader";
import { useAuth } from "../lib/hooks/useAuth";
import Unauthorized from "../components/general/Unauthorized";
import ConfigDownloads from "../components/settings/ConfigDownloads";
import UserSettings from "../components/settings/UserSettings";
import EmbedSettings from "../components/settings/EmbedSettings";

const Settings: NextPage = () => {
	const { user, loading } = useAuth();

	return (
		<main>
			<Head>
				<title>PaperPlane - Settings</title>
			</Head>
			{loading ? (
				<div className="center-items">
					<PulseLoader size={30} />
				</div>
			) : user ? (
				<div className="settings">
					<UserSettings />
					<ConfigDownloads />
					<EmbedSettings />
				</div>
			) : (
				<Unauthorized />
			)}
		</main>
	);
};

export default Settings;

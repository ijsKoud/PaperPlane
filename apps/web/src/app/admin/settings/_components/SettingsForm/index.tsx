import React from "react";
import { SettingsForm } from "./Form";
import { SettingsGetApi, getProtocol } from "@paperplane/utils";
import { cookies, headers } from "next/headers";
import axios from "axios";

const Settings: React.FC = async () => {
	const host = headers().get("host");
	const settings = await axios.get<SettingsGetApi>(`${getProtocol()}${host}/api/admin/settings`, {
		headers: { cookie: cookies().toString() }
	});

	return <SettingsForm {...settings.data} />;
};

export default Settings;

"use client";

import { useSwrWithUpdates } from "@paperplane/swr";
import { DashboardSettingsGetApi } from "@paperplane/utils";
import React, { useEffect, useState } from "react";
import ApiTokenSettings from "./_sections/ApiTokenSettings";
import SettingsForm from "./_sections/Form";

const UseDashboardSettings = () => {
	const [settings, setSettings] = useState<DashboardSettingsGetApi>({
		embedEnabled: false,
		nameLength: 10,
		nameStrategy: "id",
		tokens: [],
		embed: { title: "", description: "", color: "" }
	});
	const { data } = useSwrWithUpdates<DashboardSettingsGetApi>("/api/dashboard/settings");

	useEffect(() => {
		if (data) setSettings(data);
	}, [data]);

	return settings;
};

const Settings: React.FC = () => {
	const settings = UseDashboardSettings();

	return (
		<div className="space-y-20">
			<ApiTokenSettings tokens={settings.tokens} />
			<SettingsForm {...settings} />
		</div>
	);
};

export default Settings;

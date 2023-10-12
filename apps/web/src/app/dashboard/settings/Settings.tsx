"use client";

import React, { useEffect, useState } from "react";
import ApiTokenSettings from "./_sections/ApiTokenSettings";
import SettingsForm from "./_sections/Form";
import BigRedButtons from "./_sections/BigRedButtons";
import { PaperPlaneApiOutputs, api } from "#trpc/server";

export type DashboardSettings = PaperPlaneApiOutputs["v1"]["dashboard"]["settings"]["get"];

const UseDashboardSettings = () => {
	const [settings, setSettings] = useState<DashboardSettings>({
		embedEnabled: false,
		nameLength: 10,
		nameStrategy: "id",
		tokens: [],
		embed: { title: "", description: "", color: "" }
	});

	useEffect(() => {
		void api().v1.dashboard.settings.get.query().then(setSettings);
	}, []);

	return settings;
};

const Settings: React.FC = () => {
	const settings = UseDashboardSettings();

	return (
		<div className="space-y-20">
			<ApiTokenSettings tokens={settings.tokens} />
			<SettingsForm {...settings} />
			<BigRedButtons />
		</div>
	);
};

export default Settings;

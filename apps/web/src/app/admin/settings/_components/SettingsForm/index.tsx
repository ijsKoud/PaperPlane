import React from "react";
import { SettingsForm } from "./Form";
import { cookies, headers } from "next/headers";
import { PaperPlaneApiOutputs, api } from "#trpc/server";

export type SettingsOutput = PaperPlaneApiOutputs["v1"]["admin"]["settings"]["get"];

const Settings: React.FC = async () => {
	const host = headers().get("host")!;
	const settings = await api(host, { cookie: cookies().toString() }).v1.admin.settings.get.query();

	return <SettingsForm defaults={settings.defaults} domains={settings.domains} />;
};

export default Settings;

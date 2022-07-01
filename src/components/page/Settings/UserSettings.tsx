import React from "react";
import type { FC } from "../../../lib/types";
import ConfigDownload from "./ConfigDownload";
import PasswordForm from "./Forms/PasswordForm";
import UsernameForm from "./Forms/UsernameForm";

const UserSettings: FC = () => {
	return (
		<div className="user-settings-wrapper">
			<h1>User Settings</h1>
			<div className="user-settings">
				<UsernameForm />
				<PasswordForm />
				<ConfigDownload />
			</div>
		</div>
	);
};

export default UserSettings;

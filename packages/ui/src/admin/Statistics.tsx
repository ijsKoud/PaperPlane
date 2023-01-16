import { PAPERPLANE_VERSION } from "@paperplane/utils";
import ms from "ms";
import type React from "react";

interface Props {
	users: number;
	uptime: number;

	signupMode: "open" | "closed" | "invite";
	auth: "2FA" | "Password";
}

export const AdminStatistics: React.FC<Props> = ({ users, uptime, signupMode, auth }) => {
	return (
		<div className="bg-main p-8 rounded-xl h-full">
			<h1 className="text-xl">Service Information</h1>
			<div className="flex flex-wrap gap-x-16 gap-y-4 mt-4">
				<div>
					<h2 className="text-lg">Users</h2>
					<p className="text-4xl">{users}</p>
				</div>
				<div>
					<h2 className="text-lg">Version</h2>
					<p className="text-4xl">{PAPERPLANE_VERSION}</p>
				</div>
				<div>
					<h2 className="text-lg">Auth Mode</h2>
					<p className="text-4xl">{auth}</p>
				</div>
				<div>
					<h2 className="text-lg">Sign Up Mode</h2>
					<p className="text-4xl capitalize">{signupMode}</p>
				</div>
				<div>
					<h2 className="text-lg">Uptime</h2>
					<p className="text-4xl">{ms(uptime)}</p>
				</div>
			</div>
		</div>
	);
};

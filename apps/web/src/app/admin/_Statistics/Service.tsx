import { PAPERPLANE_VERSION } from "@paperplane/utils";
import React from "react";

export interface ServiceProps {
	/** The amount of signed up users */
	users: number;

	/** The authentication mode */
	authMode: "2fa" | "password";

	/** The signup mode */
	signupMode: "open" | "closed" | "invite";

	/** The application uptime */
	uptime: string;
}

export const Service: React.FC<ServiceProps> = ({ users, authMode, signupMode, uptime }) => {
	return (
		<div className="dark:bg-zinc-900 bg-zinc-100 border border-zinc-200 dark:border-zinc-700 rounded-xl p-8 h-full">
			<h1 className="text-7 font-bold">Service Information</h1>
			<div className="flex flex-wrap gap-x-16 gap-y-4 mt-4">
				<div>
					<h2 className="text-5 font-medium">Users</h2>
					<p className="text-14 font-black leading-[50px]">{users}</p>
				</div>
				<div>
					<h2 className="text-5 font-medium">Version</h2>
					<p className="text-14 font-black leading-[50px]">{PAPERPLANE_VERSION}</p>
				</div>
				<div>
					<h2 className="text-5 font-medium">Auth Mode</h2>
					<p className="text-14 font-black leading-[50px]">{authMode}</p>
				</div>
				<div>
					<h2 className="text-5 font-medium">Sign Up Mode</h2>
					<p className="text-14 font-black leading-[50px] capitalize">{signupMode}</p>
				</div>
				<div>
					<h2 className="text-5 font-medium">Uptime</h2>
					<p className="text-14 font-black leading-[50px]">{uptime}</p>
				</div>
			</div>
		</div>
	);
};

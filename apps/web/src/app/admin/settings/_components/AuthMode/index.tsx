import { cookies, headers } from "next/headers";
import React from "react";
import { SelectMenu } from "./Menu";
import { api } from "#trpc/server";

export const AuthMode: React.FC = async () => {
	const host = headers().get("host")!;
	const mode = await api(host, { cookie: cookies().toString() }).v1.admin.settings.authMode.query();

	return (
		<section className="space-y-2">
			<div>
				<h2 className="text-5 font-semibold">Authentication Mode</h2>
				<p className="text-4">
					Change the way people login to PaperPlane, this does not affect the{" "}
					<span className="dark:bg-gray-600 bg-gray-600/50 p-1 rounded-md">Admin Panel</span> login strategy. This will always be a 2FA
					based authentication.
				</p>
			</div>

			<p className="p-2 rounded-md my-4 bg-red-500">
				⚠️ <strong>Warning</strong>: changing this may have unintended side-effects. This could also lead to accounts being compromised if not
				handled correctly. All accounts will start with the default password or back-up code:
				<span className="dark:bg-zinc-800 bg-zinc-500 p-1 rounded-md ml-1">paperplane-cdn</span> if they one or both are unset.
			</p>

			<SelectMenu value={mode} />
		</section>
	);
};

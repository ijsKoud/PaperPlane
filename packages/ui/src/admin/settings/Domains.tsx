import { PrimaryButton } from "@paperplane/buttons";
import type React from "react";

export const AdminDomains: React.FC = () => {
	return (
		<div className="max-w-[50vw] max-xl:max-w-[75vw] max-md:max-w-[100vw] w-full">
			<div className="w-full">
				<h1 className="text-xl">Available Domains</h1>
				<p className="text-base">
					To make sign ups/account creation possible, a domain (or multiple) have to be assigned to PaperPlane. You can assign a single
					domain, domain with subdomain or multiple of each.
				</p>
			</div>
			<div className="w-full mt-4">
				<PrimaryButton type="button">Open available domains list</PrimaryButton>
			</div>
		</div>
	);
};

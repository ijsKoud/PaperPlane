import type React from "react";
import type { Metadata } from "next";
import { LogoText } from "@paperplane/logo";
import { Button } from "@paperplane/ui";
import Link from "next/link";
import { GithubIcon, LayoutDashboardIcon, ShieldIcon } from "lucide-react";

export const metadata: Metadata = {
	title: "Paperplane",
	description: "An open-source customisable solution to storing files in the cloud. ✈️"
};

const Page: React.FC = () => {
	return (
		<div className="grid place-items-center h-screen">
			<main className="flex flex-col gap-y-3 items-center justify-center">
				<div className="flex flex-col items-center">
					<LogoText height={45} width={45} textClassName="text-4xl max-sm:text-2xl" />
					<h2 className="text-base max-sm:text-comment max-sm:font-medium">
						An open-source customisable solution to storing files in the cloud. ✈️
					</h2>
				</div>
				<div className="flex gap-2 max-sm:flex-col max-sm:w-full text-center">
					<Button variant="outline" asChild>
						<Link href="https://github.com/ijsKoud/paperplane">
							<GithubIcon className="mr-2 h-4 w-4" /> GitHub
						</Link>
					</Button>
					<Button variant="outline" asChild>
						<Link href="/dashboard">
							<LayoutDashboardIcon className="mr-2 h-4 w-4" /> Dashboard
						</Link>
					</Button>
					<Button variant="outline" asChild>
						<Link href="/admin">
							<ShieldIcon className="mr-2 h-4 w-4" /> Admin Panel
						</Link>
					</Button>
				</div>
			</main>
		</div>
	);
};

export default Page;

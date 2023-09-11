"use client";

import type React from "react";
import type { Metadata } from "next";
import { Logo } from "@paperplane/logo";
import { Button } from "@paperplane/ui/button";
import Link from "next/link";
import { GithubIcon, LayoutDashboardIcon, ShieldIcon } from "lucide-react";
import { Inter } from "@next/font/google";
import { GlitchText } from "@paperplane/components/glitch";
import { useEffect, useState } from "react";
import { NotFoundError } from "@paperplane/utils";
import { ThemeToggle } from "@paperplane/components/ThemeToggle";

export const metadata: Metadata = {
	title: "404 Not Found - Paperplane",
	description: "An open-source customisable solution to storing files in the cloud. ✈️"
};

const InterFont = Inter({ weight: ["400", "700"], subsets: ["latin"], display: "swap" });

const Page: React.FC = () => {
	const [error] = useState(new NotFoundError());
	const [subtitle, setSubtitle] = useState<string>("");
	const [titleFront, setTitleFront] = useState<string>("");
	const [titleBack, setTitleBack] = useState<string>("");

	useEffect(() => {
		error.start(setSubtitle, setTitleFront, setTitleBack);
		return () => error.stop();
	}, []);

	return (
		<div className="grid place-items-center h-screen">
			<title>404 Not Found - Paperplane</title>
			<div className="fixed top-4 right-4">
				<ThemeToggle />
			</div>

			<div className="flex flex-col gap-y-3 items-center justify-center">
				<div className="flex flex-col items-center">
					<div className="flex items-center">
						<Logo width={45} height={45} />{" "}
						<h1 className="font-normal text-4xl max-sm:text-2xl" style={InterFont.style}>
							<GlitchText className={`${InterFont.className}`} text={titleFront} />
							<GlitchText className={`${InterFont.className} font-bold`} text={titleBack} />
						</h1>
					</div>
					<GlitchText text={subtitle} className="text-base max-sm:text-comment max-sm:font-medium" />
				</div>
				<p className="mt-4 max-w-[512px] text-center text-base">
					That’s weird, someone led you to a broken page. Why don’t you go back while we figure out the problem?
				</p>
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
			</div>
		</div>
	);
};

export default Page;

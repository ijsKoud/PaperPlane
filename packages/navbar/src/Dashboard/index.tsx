import type React from "react";
import { BaseNavbar } from "../index";
import { DashboardNavButton } from "./DashboardNavButton";

export const DashboardNavbar: React.FC = () => {
	return (
		<nav className="fixed z-[100] w-screen">
			<BaseNavbar />
			<div className="flex w-full bg-main border-b border-white-200 px-1 overflow-x-auto">
				<DashboardNavButton href="/dashboard">Home</DashboardNavButton>
				<DashboardNavButton href="/dashboard/files">Files</DashboardNavButton>
				<DashboardNavButton href="/dashboard/shorturls">Shorturls</DashboardNavButton>
			</div>
		</nav>
	);
};

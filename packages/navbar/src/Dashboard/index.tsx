import type React from "react";
import { BaseNavbar } from "../index";
import { DashboardNavButton } from "./DashboardNavButton";

interface Props {
	toastInfo: (str: string) => void;
}

export const DashboardNavbar: React.FC<Props> = ({ toastInfo }) => {
	return (
		<nav className="fixed z-[100] w-screen">
			<BaseNavbar settingsButton toastInfo={toastInfo} />
			<div className="flex w-full bg-main border-b border-white-200 px-1 overflow-x-auto">
				<DashboardNavButton href="/dashboard">Home</DashboardNavButton>
				<DashboardNavButton href="/dashboard/files">Files</DashboardNavButton>
				<DashboardNavButton href="/dashboard/shorturls">Shorturls</DashboardNavButton>
				<DashboardNavButton href="/dashboard/pastebin">Pastebin</DashboardNavButton>
			</div>
		</nav>
	);
};

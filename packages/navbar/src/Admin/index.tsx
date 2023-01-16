import type React from "react";
import { BaseNavbar } from "../index";
import { DashboardNavButton } from "../Dashboard/DashboardNavButton";

export const AdminNavbar: React.FC = () => {
	return (
		<nav className="fixed z-[100] w-screen">
			<BaseNavbar />
			<div className="flex w-full bg-main border-b border-white-200 px-1 overflow-x-auto">
				<DashboardNavButton href="/admin">Home</DashboardNavButton>
				<DashboardNavButton href="/admin/users">Users</DashboardNavButton>
				<DashboardNavButton href="/admin/settings">Settings</DashboardNavButton>
			</div>
		</nav>
	);
};

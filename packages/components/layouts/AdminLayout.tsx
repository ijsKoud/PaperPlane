import React from "react";
import { AdminNavbar } from "../navbar/AdminNavbar";
import { cn } from "@paperplane/utils";

export interface AdminProps {
	/** Additional class names to add to the component */
	className?: string;
}

const AdminLayout: React.FC<React.PropsWithChildren<AdminProps>> = ({ children, className }) => {
	return (
		<React.Fragment>
			<AdminNavbar />
			<div className="grid place-items-center">
				<main className={cn("p-24 flex flex-col justify-center items-center gap-y-8 max-md:pt-8 max-w-[1040px] w-full px-2", className)}>
					{children}
				</main>
			</div>
		</React.Fragment>
	);
};

export default AdminLayout;

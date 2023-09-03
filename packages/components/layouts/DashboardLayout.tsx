import React from "react";
import { DashboardNavbar } from "../navbar/DashboardNavbar";
import { cn } from "@paperplane/utils";

export interface DashboardProps {
	/** Additional class names to add to the component */
	className?: string;
}

const DashboardLayout: React.FC<React.PropsWithChildren<DashboardProps>> = ({ children, className }) => {
	return (
		<React.Fragment>
			<DashboardNavbar />
			<div className="grid place-items-center">
				<main className={cn("p-24 flex flex-col justify-center items-center gap-y-8 max-md:pt-8 max-w-[1040px] w-full px-2", className)}>
					{children}
				</main>
			</div>
		</React.Fragment>
	);
};

export default DashboardLayout;

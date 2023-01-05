import { DashboardNavbar } from "@paperplane/navbar";
import type React from "react";

export const DashboardLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
	return (
		<>
			<DashboardNavbar />
			<div className="pt-24 grid place-items-center">
				<div className="pt-24 flex flex-col justify-center items-center gap-y-8 max-md:pt-8 max-w-[1040px] w-full px-2">{children}</div>
			</div>
		</>
	);
};

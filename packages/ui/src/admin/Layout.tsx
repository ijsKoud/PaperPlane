import { AdminNavbar } from "@paperplane/navbar";
import type React from "react";

interface Props {
	className?: string;
}

export const AdminLayout: React.FC<React.PropsWithChildren<Props>> = ({ children, className }) => {
	return (
		<>
			<AdminNavbar />
			<div className="pt-24 grid place-items-center">
				<div className={`pt-24 flex flex-col justify-center items-center gap-y-8 max-md:pt-8 max-w-[1040px] w-full px-2 ${className}`}>
					{children}
				</div>
			</div>
		</>
	);
};

import { TransparentButton } from "@paperplane/buttons";
import { Input, SelectMenu } from "@paperplane/forms";
import type React from "react";

interface Props {
	pages: number;
	page: number;
	setPage: (page: number) => void;

	setSearch: (search: string) => void;

	filter: string;
	setFilter: (filter: string) => void;

	view: "grid" | "list";
	setView: (view: "grid" | "list") => void;
}

export const DashboardToolbar: React.FC<Props> = ({ setView, view }) => {
	return (
		<div className="w-full flex justify-between items-center mt-4">
			<Input type="main" placeholder="Search for a file" />
			<div className="flex gap-4">
				<TransparentButton type="button">
					<i className="fa-solid fa-angle-left text-lg" />
				</TransparentButton>
				<SelectMenu type="main" placeholder="page" />
				<TransparentButton type="button">
					<i className="fa-solid fa-angle-right text-lg" />
				</TransparentButton>
			</div>
			<SelectMenu type="main" placeholder="Filter" />
			<div className="flex gap-4 items-center">
				<TransparentButton type="button" onClick={() => setView("list")}>
					<i
						className={`fa-solid fa-list-ul text-xl text-white-400 hover:text-white-800 transition-colors ${
							view === "list" && "!text-white"
						}`}
					/>
				</TransparentButton>
				<TransparentButton type="button" onClick={() => setView("grid")}>
					<i
						className={`fa-solid fa-border-none text-xl text-white-400 hover:text-white-800 transition-colors ${
							view === "grid" && "!text-white"
						}`}
					/>
				</TransparentButton>
			</div>
		</div>
	);
};

import { DangerButton, SuccessButton } from "@paperplane/buttons";
import type React from "react";

interface Props {
	items: string[];
	type: "file" | "shorturl";
}

export const DashboardDeleteBanner: React.FC<Props> = ({ items, type }) => {
	const correctTypeForm = items.length === 1 ? type : `${type}s`;

	return (
		<div className="px-4 fixed bottom-4 max-w-[1008px] w-full">
			<div className="bg-main p-4 border-white-100 border rounded-xl flex items-center justify-between w-full max-md:flex-col gap-y-4">
				<p className="text-base text-center">
					Are you sure you want to delete{" "}
					<span className="font-semibold">
						{items.length} {correctTypeForm}
					</span>
					?
				</p>
				<div className="flex items-center justify-center gap-2">
					<DangerButton type="button" className="rounded-lg">
						Yes do it!
					</DangerButton>
					<SuccessButton type="button" className="rounded-lg">
						No go back!
					</SuccessButton>
				</div>
			</div>
		</div>
	);
};

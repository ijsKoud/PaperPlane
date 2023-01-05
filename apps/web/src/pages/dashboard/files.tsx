import type { NextPage } from "next";
import { DashboardLayout, DashboardToolbar } from "@paperplane/ui";
import { TertiaryButton } from "@paperplane/buttons";

const FilesDashboard: NextPage = () => {
	const emptyFunction = () => void 0;

	return (
		<DashboardLayout>
			<div className="w-full flex justify-between items-center">
				<h1 className="text-4xl">Files</h1>
				<TertiaryButton type="button">Upload</TertiaryButton>
			</div>
			<DashboardToolbar filter="" page={1} pages={1} setFilter={emptyFunction} setPage={emptyFunction} setSearch={emptyFunction} />
		</DashboardLayout>
	);
};

export default FilesDashboard;

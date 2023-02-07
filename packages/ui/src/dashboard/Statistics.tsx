import { PAPERPLANE_VERSION } from "@paperplane/utils";
import type React from "react";

interface Props {
	files: number;
	shorturls: number;
}

export const DashboardStatistics: React.FC<Props> = ({ files, shorturls }) => {
	return (
		<div className="bg-main p-8 rounded-xl h-full w-full">
			<h1 className="text-xl">Statistics</h1>
			<div className="flex flex-wrap gap-x-16 gap-y-4 mt-4">
				<div>
					<h2 className="text-lg">Files</h2>
					<p className="text-4xl">{files}</p>
				</div>
				<div>
					<h2 className="text-lg">Shorturls</h2>
					<p className="text-4xl">{shorturls}</p>
				</div>
				<div>
					<h2 className="text-lg">Total</h2>
					<p className="text-4xl">{files + shorturls}</p>
				</div>
				<div>
					<h2 className="text-lg">Version</h2>
					<p className="text-4xl">{PAPERPLANE_VERSION}</p>
				</div>
			</div>
		</div>
	);
};

import { formatBytes, getCircleColor } from "@paperplane/utils";
import type React from "react";
import { CircleProgressBar } from "../index";

interface Props {
	used: number;
	total: number;
}

export const DashboardStorageUsage: React.FC<Props> = ({ used, total }) => {
	const percentage = (used / total) * 100;

	return (
		<div className="bg-main rounded-xl flex flex-col justify-center items-center gap-7 h-full min-w-[16rem] max-md:w-full max-md:py-4">
			<h1 className="text-lg">Storage Usage</h1>
			<div className="relative h-40 w-40">
				<CircleProgressBar percentage={percentage} color={getCircleColor(percentage)} />
				<p className="absolute text-3xl left-0 top-0 right-0 text-center translate-y-3/4">{percentage}%</p>
			</div>
			<p>
				<strong>{formatBytes(used)}</strong> out of <strong>{formatBytes(total)}</strong> used
			</p>
		</div>
	);
};

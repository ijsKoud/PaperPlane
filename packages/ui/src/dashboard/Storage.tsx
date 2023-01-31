import { formatBytes, getCircleColor } from "@paperplane/utils";
import type React from "react";
import { CircleProgressBar } from "../index";

interface Props {
	used: number;
	total: number;
}

export const DashboardStorageUsage: React.FC<Props> = ({ used, total }) => {
	const isInfinitive = total === 0;
	const _percentage = (used / total) * 100;
	const percentage = isNaN(_percentage) ? 0 : _percentage;

	return (
		<div className="bg-main rounded-xl flex flex-col justify-center items-center gap-7 h-full min-w-[16rem] max-md:w-full max-md:py-4">
			<h1 className="text-lg">Storage Usage</h1>
			<div className="relative h-40 w-40">
				<CircleProgressBar
					percentage={isInfinitive ? 100 : percentage}
					color={isInfinitive ? getCircleColor(0) : getCircleColor(percentage)}
				/>
				<p className="absolute text-3xl left-0 top-0 right-0 text-center translate-y-3/4">
					{isInfinitive ? <i className="fa-solid fa-infinity" /> : `${percentage}%`}
				</p>
			</div>
			<p>
				<strong>{formatBytes(used)}</strong> out of{" "}
				<strong>{isInfinitive ? <i className="fa-solid fa-infinity" /> : formatBytes(total)}</strong> used
			</p>
		</div>
	);
};

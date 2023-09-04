"use client";

import { PAPERPLANE_VERSION, formatBytes, getCircleColor } from "@paperplane/utils";
import { CircleProgressBar } from "@paperplane/components/src/global/Progress/Circle";
import type React from "react";
import { UseDashboardStats } from "./_lib/hooks";
import { InfinityIcon } from "lucide-react";

interface StorageUsageProps {
	used: number;
	total: number;
}

const StorageUsage: React.FC<StorageUsageProps> = ({ used, total }) => {
	const isInfinitive = total === 0;
	const _percentage = (used / total) * 100;
	const percentage = isNaN(_percentage) ? 0 : Math.round(_percentage);

	return (
		<div className="dark:bg-zinc-900 bg-zinc-100 border border-zinc-200 dark:border-zinc-700 rounded-xl flex flex-col justify-center items-center gap-7 h-full min-w-[16rem] max-md:w-full max-md:py-4">
			<h1 className="text-lg">Storage Usage</h1>
			<div className="relative h-40 w-40">
				<CircleProgressBar
					percentage={isInfinitive ? 100 : percentage}
					color={isInfinitive ? getCircleColor(0) : getCircleColor(percentage)}
				/>
				{isInfinitive ? (
					<div className="absolute left-0 top-0 w-full h-full grid place-items-center">
						<InfinityIcon size={48} />
					</div>
				) : (
					<p className="absolute text-3xl left-0 top-0 right-0 text-center translate-y-3/4">{percentage}%</p>
				)}
			</div>
			<p>
				<strong>{formatBytes(used)}</strong> out of <strong>{isInfinitive ? "∞" : formatBytes(total)}</strong> used
			</p>
		</div>
	);
};

interface StatisticsProps {
	files: number;
	shorturls: number;
	pastebins: number;
}

const Statistics: React.FC<StatisticsProps> = ({ files, shorturls, pastebins }) => {
	return (
		<div className="dark:bg-zinc-900 bg-zinc-100 border border-zinc-200 dark:border-zinc-700 p-8 rounded-xl h-full w-full">
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
					<h2 className="text-lg">Pastebins</h2>
					<p className="text-4xl">{pastebins}</p>
				</div>
				<div>
					<h2 className="text-lg">Total</h2>
					<p className="text-4xl">{files + shorturls + pastebins}</p>
				</div>
				<div>
					<h2 className="text-lg">Version</h2>
					<p className="text-4xl">{PAPERPLANE_VERSION}</p>
				</div>
			</div>
		</div>
	);
};

const DashboardStats: React.FC = () => {
	const stats = UseDashboardStats();

	return (
		<div className="w-full h-80 flex gap-8 items-center px-2 max-md:flex-col max-md:h-auto">
			<StorageUsage used={stats.storage.used} total={stats.storage.total} />
			<Statistics files={stats.files} shorturls={stats.shorturls} pastebins={stats.pastebins} />
		</div>
	);
};

export default DashboardStats;

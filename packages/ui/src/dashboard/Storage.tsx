import { formatBytes } from "@paperplane/utils";
import type React from "react";

interface Props {
	storageUsage: number;
	cpuUsage: number;

	memoryUsage: number;
	memoryTotal: number;
}

export const DashboardStorageUsage: React.FC<Props> = ({ storageUsage, memoryTotal, memoryUsage, cpuUsage }) => {
	return (
		<div className="h-full flex flex-col justify-between max-md:w-full max-md:gap-2">
			<div className="bg-main rounded-xl flex flex-col justify-center items-center min-w-[16rem] py-5 max-md:w-full">
				<h1 className="text-lg">Storage Usage</h1>
				<p className="text-base">
					<strong>{formatBytes(storageUsage)}</strong> used
				</p>
			</div>
			<div className="bg-main rounded-xl flex flex-col justify-center items-center min-w-[16rem] py-5 max-md:w-full">
				<h1 className="text-lg">Cpu Usage</h1>
				<p className="text-base">
					<strong>{cpuUsage}%</strong> in use
				</p>
			</div>
			<div className="bg-main rounded-xl flex flex-col justify-center items-center min-w-[16rem] py-5 max-md:w-full">
				<h1 className="text-lg">Memory Usage</h1>
				<p className="text-base">
					<strong>{formatBytes(memoryUsage)}</strong> of the {<strong>{formatBytes(memoryTotal)}</strong>} in use
				</p>
			</div>
		</div>
	);
};

import { DashboardNavbar } from "@paperplane/navbar";
import { getCircleColor } from "@paperplane/utils";
import type { NextPage } from "next";
import { Circle } from "rc-progress";

const Dashboard: NextPage = () => {
	const storagePercentage = 10;

	return (
		<>
			<DashboardNavbar />
			<div className="pt-24 px-[175px]">
				<div className="pt-24">
					<div className="flex justify-between items-center">
						<div className="bg-main p-8 rounded-xl flex flex-col justify-center items-center gap-7">
							<h1 className="text-lg">Storage Usage</h1>
							<div className="relative h-40 w-40">
								<Circle
									percent={storagePercentage}
									strokeWidth={8}
									strokeLinecap="butt"
									trailColor="rgba(0,0,0,0)"
									strokeColor={getCircleColor(storagePercentage)}
								/>
								<p className="absolute text-3xl left-0 top-0 right-0 text-center translate-y-3/4">{storagePercentage}%</p>
							</div>
							<p>
								<strong>7.7</strong> GB out of <strong>10.0</strong> GB used
							</p>
						</div>
						<div>Stats</div>
					</div>
					<div>audit logs</div>
				</div>
			</div>
		</>
	);
};

export default Dashboard;

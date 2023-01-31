import type { GetServerSideProps, NextPage } from "next";
import { DashboardLayout, DashboardStatistics, DashboardStorageUsage, Table, TableEntry } from "@paperplane/ui";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { DashboardStatsGetApi, getProtocol } from "@paperplane/utils";
import { useSwrWithUpdates } from "@paperplane/swr";
import axios from "axios";

export const getServerSideProps: GetServerSideProps = async (context) => {
	const stateRes = await axios.get<{ admin: boolean; domain: boolean }>(`${getProtocol()}${context.req.headers.host}/api/auth/state`, {
		headers: { "X-PAPERPLANE-AUTH-KEY": context.req.cookies["PAPERPLANE-AUTH"] }
	});

	if (!stateRes.data.domain)
		return {
			redirect: {
				destination: "/login",
				permanent: false
			}
		};

	return {
		props: {}
	};
};

const Dashboard: NextPage = () => {
	const [stats, setStats] = useState<DashboardStatsGetApi>({ files: 0, shorturls: 0, storage: { total: 0, used: 0 } });
	const { data: statsData } = useSwrWithUpdates("/api/dashboard/stats");

	useEffect(() => {
		if (statsData) setStats(statsData);
	}, [statsData]);

	return (
		<DashboardLayout toastInfo={(str) => toast.info(str)}>
			<div className="w-full h-80 flex gap-8 items-center px-2 max-md:flex-col max-md:h-auto">
				<DashboardStorageUsage used={stats.storage.used} total={stats.storage.total} />
				<DashboardStatistics files={stats.files} shorturls={stats.shorturls} />
			</div>
			<div className="w-full px-2">
				<div className="w-full rounded-lg bg-main p-8 flex flex-col gap-2">
					<h1 className="text-xl">Audit Logs</h1>
					<div className="w-full overflow-x-auto max-w-[calc(100vw-16px-64px-16px)]">
						<Table className="w-full min-w-[750px]" headPosition="left" heads={["Action", "Details", "Date"]}>
							<TableEntry>
								<td>Image Uploaded</td>
								<td>Desktop: Windows 11 - Chrome</td>
								<td>12 Dec. 2022 4:32 PM</td>
							</TableEntry>
							<TableEntry>
								<td>Image Uploaded</td>
								<td>Desktop: Windows 11 - Chrome</td>
								<td>12 Dec. 2022 4:32 PM</td>
							</TableEntry>
							<TableEntry>
								<td>Image Uploaded</td>
								<td>Desktop: Windows 11 - Chrome</td>
								<td>12 Dec. 2022 4:32 PM</td>
							</TableEntry>
							<TableEntry>
								<td>Image Uploaded</td>
								<td>Desktop: Windows 11 - Chrome</td>
								<td>12 Dec. 2022 4:32 PM</td>
							</TableEntry>
							<TableEntry>
								<td>Image Uploaded</td>
								<td>Desktop: Windows 11 - Chrome</td>
								<td>12 Dec. 2022 4:32 PM</td>
							</TableEntry>
							<TableEntry>
								<td>Image Uploaded</td>
								<td>Desktop: Windows 11 - Chrome</td>
								<td>12 Dec. 2022 4:32 PM</td>
							</TableEntry>
						</Table>
					</div>
				</div>
			</div>
		</DashboardLayout>
	);
};

export default Dashboard;

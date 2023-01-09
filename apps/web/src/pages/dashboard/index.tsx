import type { NextPage } from "next";
import { DashboardLayout, DashboardStatistics, DashboardStorageUsage, Table, TableEntry } from "@paperplane/ui";

const Dashboard: NextPage = () => {
	return (
		<DashboardLayout>
			<div className="w-full h-80 flex gap-8 items-center px-2 max-md:flex-col max-md:h-auto">
				<DashboardStorageUsage used={7.7e9} total={1e10} />
				<DashboardStatistics files={1528} shorturls={38} />
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

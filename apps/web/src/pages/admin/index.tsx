import type { GetServerSideProps, NextPage } from "next";
import { AdminLayout, AdminStatistics, AdminUsage, Table, TableEntry } from "@paperplane/ui";
import axios from "axios";
import { getProtocol, ServiceApi } from "@paperplane/utils";
import { useSwrWithUpdates } from "@paperplane/swr";
import { useEffect, useState } from "react";

export const getServerSideProps: GetServerSideProps = async (context) => {
	const stateRes = await axios.get<{ admin: boolean; domain: boolean }>(`${getProtocol()}${context.req.headers.host}/api/auth/state`, {
		headers: { "X-PAPERPLANE-ADMIN-KEY": context.req.cookies["PAPERPLANE-ADMIN"] }
	});

	if (!stateRes.data.admin)
		return {
			redirect: {
				destination: "/login?user=admin",
				permanent: false
			}
		};

	return {
		props: {}
	};
};

const AdminPanel: NextPage = () => {
	const [service, setService] = useState<ServiceApi>({
		authMode: "2fa",
		cpuUsage: 0,
		memory: { total: 0, usage: 0 },
		signUpMode: "closed",
		storageUsage: 0,
		uptime: 0,
		users: 0,
		version: "0.0.0"
	});
	const { data } = useSwrWithUpdates<ServiceApi>("/api/admin/service", undefined, (url) =>
		axios({ url, withCredentials: true }).then((res) => res.data)
	);

	useEffect(() => {
		if (data) setService(data);
	}, [data]);

	return (
		<AdminLayout>
			<div className="w-full h-80 flex gap-6 items-center px-2 max-md:flex-col max-md:h-auto">
				<AdminUsage
					storageUsage={service.storageUsage}
					cpuUsage={service.cpuUsage}
					memoryTotal={service.memory.total}
					memoryUsage={service.memory.usage}
				/>
				<AdminStatistics users={service.users} auth={service.authMode} signupMode={service.signUpMode} uptime={service.uptime} />
			</div>
			<div className="w-full px-2">
				<div className="w-full rounded-lg bg-main p-8 flex flex-col gap-2">
					<h1 className="text-xl">Audit Logs</h1>
					<div className="w-full overflow-x-auto max-w-[calc(100vw-16px-64px-16px)]">
						<Table className="w-full min-w-[750px]" headPosition="left" heads={["Action", "User", "Date"]}>
							<TableEntry>
								<td>Image Uploaded</td>
								<td>cdn.ijskoud.dev</td>
								<td>12 Dec. 2022 4:32 PM</td>
							</TableEntry>
							<TableEntry>
								<td>Image Uploaded</td>
								<td>cdn.ijskoud.dev</td>
								<td>12 Dec. 2022 4:32 PM</td>
							</TableEntry>
							<TableEntry>
								<td>Image Uploaded</td>
								<td>cdn.ijskoud.dev</td>
								<td>12 Dec. 2022 4:32 PM</td>
							</TableEntry>
							<TableEntry>
								<td>Image Uploaded</td>
								<td>cdn.ijskoud.dev</td>
								<td>12 Dec. 2022 4:32 PM</td>
							</TableEntry>
							<TableEntry>
								<td>Image Uploaded</td>
								<td>cdn.ijskoud.dev</td>
								<td>12 Dec. 2022 4:32 PM</td>
							</TableEntry>
							<TableEntry>
								<td>Image Uploaded</td>
								<td>cdn.ijskoud.dev</td>
								<td>12 Dec. 2022 4:32 PM</td>
							</TableEntry>
						</Table>
					</div>
				</div>
			</div>
		</AdminLayout>
	);
};

export default AdminPanel;

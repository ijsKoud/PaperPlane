import type { GetServerSideProps, NextPage } from "next";
import { AdminLayout, AdminStatistics, AdminUsage, AuditLogToolbar, Table, TableEntry } from "@paperplane/ui";
import axios from "axios";
import { AuditLogApi, formatDate, getProtocol, ServiceApi } from "@paperplane/utils";
import { useSwrWithUpdates } from "@paperplane/swr";
import { useEffect, useState } from "react";
import { NextSeo } from "next-seo";
import { toast } from "react-toastify";

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
	const { data: serviceData } = useSwrWithUpdates<ServiceApi>("/api/admin/service", undefined, (url) =>
		axios({ url, withCredentials: true }).then((res) => res.data)
	);

	const [page, setPage] = useState(0);
	const [search, setSearch] = useState("");
	const [auditLogData, setAuditLogData] = useState<AuditLogApi>({ entries: [], pages: 0 });
	const { data: auditData } = useSwrWithUpdates<AuditLogApi>(`/api/admin/audit?page=${page}&search=${encodeURIComponent(search)}`);

	useEffect(() => {
		if (serviceData) setService(serviceData);
		if (auditData) setAuditLogData(auditData);
	}, [serviceData, auditData]);

	return (
		<AdminLayout toastInfo={(str) => toast.info(str)}>
			<NextSeo title="Admin Panel" />
			<div className="w-full h-80 flex gap-6 items-center px-2 max-md:flex-col max-md:h-auto">
				<AdminUsage
					storageUsage={service.storageUsage}
					cpuUsage={service.cpuUsage}
					memoryTotal={service.memory.total}
					memoryUsage={service.memory.usage}
				/>
				<AdminStatistics users={service.users} auth={service.authMode} signupMode={service.signUpMode} uptime={service.uptime} />
			</div>
			<div className="w-full px-2 mb-4">
				<div className="w-full rounded-lg bg-main p-8 flex flex-col gap-2">
					<div className="mb-2">
						<h1 className="text-xl max-sm:text-center">Audit Logs</h1>
						<AuditLogToolbar page={page} pages={auditLogData.pages} setPage={setPage} setSearch={setSearch} />
					</div>
					<div className="w-full overflow-x-auto max-w-[calc(100vw-16px-64px-16px)]">
						<Table className="w-full min-w-[750px]" headPosition="left" heads={["Action", "Details", "Date"]}>
							{auditLogData.entries.map((entry, key) => (
								<TableEntry key={key}>
									<td>{entry.type}</td>
									<td>{entry.details}</td>
									<td>{formatDate(entry.date)}</td>
								</TableEntry>
							))}
						</Table>
					</div>
				</div>
			</div>
		</AdminLayout>
	);
};

export default AdminPanel;

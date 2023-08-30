import type { GetServerSideProps, NextPage } from "next";
import { AuditLogToolbar, DashboardLayout, DashboardStatistics, DashboardStorageUsage, Table, TableEntry } from "@paperplane/components";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { type AuditLogApi, type DashboardStatsGetApi, formatDate, getProtocol } from "@paperplane/utils";
import { useSwrWithUpdates } from "@paperplane/swr";
import axios from "axios";
import { NextSeo } from "next-seo";

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
	const [stats, setStats] = useState<DashboardStatsGetApi>({ files: 0, shorturls: 0, pastebins: 0, storage: { total: 0, used: 0 } });
	const { data: statsData } = useSwrWithUpdates("/api/dashboard/stats");

	const [page, setPage] = useState(0);
	const [search, setSearch] = useState("");
	const [auditLogData, setAuditLogData] = useState<AuditLogApi>({ entries: [], pages: 0 });
	const { data: auditData } = useSwrWithUpdates<AuditLogApi>(`/api/dashboard/audit?page=${page}&search=${encodeURIComponent(search)}`);

	useEffect(() => {
		if (statsData) setStats(statsData);
		if (auditData) setAuditLogData(auditData);
	}, [statsData]);

	return (
		<DashboardLayout toastInfo={(str) => toast.info(str)}>
			<NextSeo title="Dashboard" />
			<div className="w-full h-80 flex gap-8 items-center px-2 max-md:flex-col max-md:h-auto">
				<DashboardStorageUsage used={stats.storage.used} total={stats.storage.total} />
				<DashboardStatistics files={stats.files} shorturls={stats.shorturls} pastebins={stats.pastebins} />
			</div>
			<div className="w-full px-2">
				<div className="w-full rounded-lg bg-main p-8 flex flex-col gap-2">
					<h1 className="text-xl">Audit Logs</h1>
					<AuditLogToolbar page={page} pages={auditLogData.pages} setPage={setPage} setSearch={setSearch} />
					<div className="w-full overflow-x-auto max-w-[calc(100vw-16px-64px-16px)]">
						<Table className="w-full min-w-[750px]" headPosition="left" heads={["Action", "Details", "Date"]}>
							{auditLogData.entries.map((audit, key) => (
								<TableEntry key={key}>
									<td>{audit.type}</td>
									<td>{audit.details}</td>
									<td>{formatDate(audit.date)}</td>
								</TableEntry>
							))}
						</Table>
					</div>
				</div>
			</div>
		</DashboardLayout>
	);
};

export default Dashboard;

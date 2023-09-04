import { useSwrWithUpdates } from "@paperplane/swr";
import { AuditLogApi, DashboardStatsGetApi } from "@paperplane/utils";
import { useEffect, useState } from "react";

export const UseDashboardStats = () => {
	const [stats, setStats] = useState<DashboardStatsGetApi>({ files: 0, shorturls: 0, pastebins: 0, storage: { total: 0, used: 0 } });
	const { data: statsData } = useSwrWithUpdates<DashboardStatsGetApi>("/api/dashboard/stats");

	useEffect(() => {
		if (statsData) setStats(statsData);
	}, [statsData]);

	return stats;
};

export const UseDashboardAudit = () => {
	const [page, setPage] = useState(0);
	const [search, setSearch] = useState("");

	const [auditLogData, setAuditLogData] = useState<AuditLogApi>({ entries: [], pages: 0 });
	const { data: auditData } = useSwrWithUpdates<AuditLogApi>(`/api/dashboard/audit?page=${page}&search=${encodeURIComponent(search)}`);

	useEffect(() => {
		if (auditData) setAuditLogData(auditData);
	}, [auditData]);

	return {
		logs: auditLogData.entries,
		pages: auditLogData.pages,
		page,
		setPage,
		search,
		setSearch
	};
};

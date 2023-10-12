import { PaperPlaneApiOutputs, api } from "#trpc/server";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type DashboardStats = PaperPlaneApiOutputs["v1"]["dashboard"]["stats"];
export type AuditlogOutput = PaperPlaneApiOutputs["v1"]["dashboard"]["audit"];

/**
 * Dashboard stats getter hook
 * @returns
 */
export const UseDashboardStats = () => {
	const [stats, setStats] = useState<DashboardStats>({ files: 0, shorturls: 0, pastebins: 0, storage: { total: 0, used: 0 } });
	const getStats = () => api().v1.dashboard.stats.query();

	useEffect(() => {
		void getStats().then(setStats);
		const interval = setInterval(() => void getStats().then(setStats), 5e3);

		return () => clearInterval(interval);
	}, []);

	return stats;
};

/**
 * Auditlogs getter hook
 * @param init The initial search parameter data
 * @returns
 */
export const UseDashboardAuditLogs = (init: { query: string; page: number }) => {
	const params = useSearchParams();
	const pathname = usePathname();
	const router = useRouter();

	const [page, _setPage] = useState(init.page);
	const [query, setQuery] = useState(init.query);

	const [auditLogData, setAuditLogData] = useState<AuditlogOutput>({ entries: [], pages: 0 });

	useEffect(() => {
		void api().v1.dashboard.audit.query({ page, query }).then(setAuditLogData);
	}, [query, page]);

	const setPage = (page: number) => {
		const searchParams = new URLSearchParams(params.toString());
		searchParams.set("page", `${page}`);
		_setPage(page);

		router.replace(`${pathname}?${searchParams}`);
	};

	const setSearch = (search: string) => {
		const searchParams = new URLSearchParams(params.toString());
		if (search.length) searchParams.set("q", search);
		else searchParams.delete("q");
		setQuery(search);

		router.replace(`${pathname}?${searchParams}`);
	};

	return {
		logs: auditLogData.entries,
		pages: auditLogData.pages,
		page,
		setPage,
		search: query,
		setSearch
	};
};

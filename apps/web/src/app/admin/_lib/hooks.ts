import { PaperPlaneApiOutputs, api } from "#trpc/server";
import { useSwrWithUpdates } from "@paperplane/swr";
import { BackupsGetApi, InviteGetApi, SignUpDomainGetApi } from "@paperplane/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type ServiceOutput = PaperPlaneApiOutputs["v1"]["admin"]["service"];
type AuditlogOutput = PaperPlaneApiOutputs["v1"]["admin"]["audit"];

export const UseAdminStats = () => {
	const [service, setService] = useState<ServiceOutput>({
		authMode: "2fa",
		cpuUsage: "0 kB",
		memoryUsage: { total: "0 kB", usage: "0 kB" },
		signUpMode: "closed",
		storageUsage: "0 kB",
		uptime: "0s",
		users: 0
	});

	const updateStats = () => api().v1.admin.service.query().then(setService);

	useEffect(() => {
		void updateStats();

		const interval = setInterval(updateStats, 5e3);
		return () => clearInterval(interval);
	}, []);

	return service;
};

/**
 * Auditlogs getter hook
 * @param init The initial search parameter data
 * @returns
 */
export const UseAdminAudit = (init: { query: string; page: number }) => {
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

export const UseAdminDomains = () => {
	const [page, setPage] = useState(0);

	const [domainData, setDomainData] = useState<SignUpDomainGetApi>({ entries: [], pages: 0 });
	const { data } = useSwrWithUpdates<SignUpDomainGetApi>(`/api/admin/domains?page=${page}`);

	useEffect(() => {
		if (data) setDomainData(data);
	}, [data]);

	return {
		...domainData,
		page,
		setPage
	};
};

export const UseAdminInvites = () => {
	const [page, setPage] = useState(0);

	const [inviteData, setInviteData] = useState<InviteGetApi>({ entries: [], pages: 0 });
	const { data } = useSwrWithUpdates<InviteGetApi>(`/api/invites/list?page=${page}`);

	useEffect(() => {
		if (data) setInviteData(data);
	}, [data]);

	return {
		...inviteData,
		page,
		setPage
	};
};

export const UseAdminBackups = () => {
	const [page, setPage] = useState(0);

	const [backupData, setBackupData] = useState<BackupsGetApi>({ entries: [], pages: 0 });
	const { data } = useSwrWithUpdates<BackupsGetApi>(`/api/admin/backups/list?page=${page}`);

	useEffect(() => {
		if (data) setBackupData(data);
	}, [data]);

	return {
		...backupData,
		page,
		setPage
	};
};

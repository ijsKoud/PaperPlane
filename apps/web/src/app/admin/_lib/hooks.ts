import { PaperPlaneApiOutputs, api } from "#trpc/server";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type ServiceOutput = PaperPlaneApiOutputs["v1"]["admin"]["service"];
type AuditlogOutput = PaperPlaneApiOutputs["v1"]["admin"]["audit"];
type AdminDomainsOutput = PaperPlaneApiOutputs["v1"]["admin"]["domains"]["list"];
type AdminInvitesOutput = PaperPlaneApiOutputs["v1"]["admin"]["invite"]["list"];
type AdminBackupsOutput = PaperPlaneApiOutputs["v1"]["admin"]["backup"]["list"];

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
		void api().v1.admin.audit.query({ page, query }).then(setAuditLogData);
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
	const [domainData, setDomainData] = useState<AdminDomainsOutput>({ entries: [], pages: 0 });

	useEffect(() => {
		void api().v1.admin.domains.list.query(page).then(setDomainData);
	}, [page]);

	return {
		...domainData,
		page,
		setPage
	};
};

export const UseAdminInvites = () => {
	const [page, setPage] = useState(0);
	const [data, setData] = useState<AdminInvitesOutput>({ entries: [], pages: 0 });

	useEffect(() => {
		void api().v1.admin.invite.list.query(page).then(setData);
	}, [page]);

	return {
		...data,
		page,
		setPage
	};
};

export const UseAdminBackups = () => {
	const [page, setPage] = useState(0);
	const [data, setData] = useState<AdminBackupsOutput>({ entries: [], pages: 0, createInProgress: false, importInProgress: undefined });

	useEffect(() => {
		const updateData = () => api().v1.admin.backup.list.query(page).then(setData);
		void updateData();

		const interval = setInterval(updateData, 2e3);
		return () => clearInterval(interval);
	}, [page]);

	return {
		...data,
		page,
		setPage
	};
};

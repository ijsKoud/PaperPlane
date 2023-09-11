import { useSwrWithUpdates } from "@paperplane/swr";
import { AuditLogApi, ServiceApi, SignUpDomainGetApi } from "@paperplane/utils";
import axios from "axios";
import { useEffect, useState } from "react";

export const UseAdminStats = () => {
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

	return service;
};

export const UseAdminAudit = () => {
	const [page, setPage] = useState(0);
	const [search, setSearch] = useState("");

	const [auditLogData, setAuditLogData] = useState<AuditLogApi>({ entries: [], pages: 0 });
	const { data: auditData } = useSwrWithUpdates<AuditLogApi>(`/api/admin/audit?page=${page}&search=${encodeURIComponent(search)}`);

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

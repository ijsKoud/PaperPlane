import { useSwrWithUpdates } from "@paperplane/swr";
import { ServiceApi } from "@paperplane/utils";
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

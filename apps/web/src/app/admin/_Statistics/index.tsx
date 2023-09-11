"use client";

import React from "react";
import { Service } from "./Service";
import { UseAdminStats } from "../_lib/hooks";
import { Usage } from "./Usage";

const Statistics: React.FC = () => {
	const stats = UseAdminStats();

	return (
		<div className="w-full h-80 flex gap-6 items-center px-2 max-md:flex-col max-md:h-auto">
			<Usage cpuUsage={stats.cpuUsage} storageUsage={stats.storageUsage} memoryUsage={stats.memory.usage} memoryTotal={stats.memory.total} />
			<Service authMode={stats.authMode} signupMode={stats.signUpMode} uptime={stats.uptime} users={stats.users} />
		</div>
	);
};

export default Statistics;

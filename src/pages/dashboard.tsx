import type { NextPage } from "next";
import React from "react";

import Statistics from "../components/dashboard/Statistics";
import FileTable from "../components/dashboard/FileTable";

const Dashboard: NextPage = () => {
	return (
		<main>
			<Statistics />
			<FileTable />
		</main>
	);
};

export default Dashboard;

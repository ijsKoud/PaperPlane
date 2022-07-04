import React from "react";
import type { FC } from "../../../lib/types";
import Navbar from "../../general/Navbar";
import LinksList from "./LinksList";
import FilesList from "./FilesList";
import StatsContainer from "./StatsContainer";

const Dashboard: FC = () => {
	return (
		<>
			<Navbar />
			<StatsContainer />
			<FilesList />
			<LinksList />
		</>
	);
};

export default Dashboard;

import React from "react";
import type { FC } from "../../../lib/types";
import Navbar from "../../general/Navbar";
import LinksList from "./LinksList";
import FilesList from "./FilesList";
import StatsContainer from "./StatsContainer";

interface Props {
	protocol: string;
}

const Dashboard: FC<Props> = ({ protocol }) => {
	return (
		<>
			<Navbar />
			<StatsContainer />
			<FilesList protocol={protocol} />
			<LinksList protocol={protocol} />
		</>
	);
};

export default Dashboard;

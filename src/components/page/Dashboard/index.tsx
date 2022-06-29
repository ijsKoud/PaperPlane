import React from "react";
import type { FC } from "../../../lib/types";
import Navbar from "../../general/Navbar";
import LinksList from "./LinksList";
import FilesList from "./FilesList";

interface Props {
	protocol: string;
}

const Dashboard: FC<Props> = ({ protocol }) => {
	return (
		<>
			<Navbar />
			<FilesList protocol={protocol} />
			<LinksList protocol={protocol} />
		</>
	);
};

export default Dashboard;

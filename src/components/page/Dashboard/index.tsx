import React from "react";
import type { FC } from "../../../lib/types";
import Navbar from "../../general/Navbar";
import FilesList from "./FilesList";

interface Props {
	protocol: string;
}

const Dashboard: FC<Props> = ({ protocol }) => {
	return (
		<>
			<Navbar />
			<FilesList protocol={protocol} />
		</>
	);
};

export default Dashboard;

import React from "react";
import { PulseLoader as ReactLoader } from "react-spinners";

interface Props {
	size?: number;
}

const Loader: React.FC<Props> = ({ size }) => {
	return <ReactLoader size={size} color={"#fff"} />;
};

export default Loader;

import React from "react";
import { PulseLoader as ReactLoader } from "react-spinners";
import { useAuth } from "../../lib/hooks/useAuth";

interface Props {
	size?: number;
}

const PulseLoader: React.FC<Props> = ({ size }) => {
	const { user } = useAuth();
	return <ReactLoader size={size} color={user ? (user.theme === "dark" ? "#fff" : "#000000") : "#fff"} />;
};

export default PulseLoader;

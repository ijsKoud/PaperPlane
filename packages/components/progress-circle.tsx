import React from "react";
import { Circle } from "rc-progress";

interface Props {
	percentage: number;
	color: string;
}

const ProgressCirlce: React.FC<Props> = ({ percentage, color }) => {
	return <Circle percent={percentage} strokeWidth={8} strokeLinecap="butt" trailColor="rgba(0,0,0,0)" strokeColor={color} />;
};

export default ProgressCirlce;

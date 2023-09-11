import "./glitch.css";
import type React from "react";

interface Props {
	text: string;
	className?: string;
}

export const GlitchText: React.FC<Props> = ({ text, className }) => {
	return (
		<p className={`${className ?? ""} hero glitch layers`} data-text={text}>
			<span>{text}</span>
		</p>
	);
};

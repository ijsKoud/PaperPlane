import type React from "react";
import { Logo, type Props as LogoProps } from ".";
import { Nunito } from "@next/font/google";

const nunito = Nunito({ weight: ["400", "700"], subsets: ["latin"], display: "swap" });

interface TextProps {
	className?: string;
	textClassName?: string;
}

type Props = TextProps & LogoProps;

export const LogoText: React.FC<Props> = ({ className, textClassName, height, width }) => {
	return (
		<div className={`flex items-center ${className ?? ""}`}>
			<Logo width={width} height={height} />{" "}
			<h1 className={` font-normal ${textClassName}`} style={nunito.style}>
				<span style={nunito.style}>APER</span>
				<span className="font-bold" style={nunito.style}>
					PLANE
				</span>
			</h1>
		</div>
	);
};

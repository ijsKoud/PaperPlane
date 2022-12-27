import type React from "react";
import type { SingleValueProps } from "react-select";

export const SelectSingleValue: React.FC<SingleValueProps> = (props) => {
	const { children, isDisabled, innerProps } = props;

	return (
		<div className={`row-[1/2] col-[1/3] ${isDisabled ? "text-white-200" : "text-white"}`} {...innerProps}>
			{children}
		</div>
	);
};

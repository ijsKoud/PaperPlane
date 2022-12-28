import type React from "react";
import type { SingleValueProps } from "react-select";
import type { SelectOption } from "../types";
import { cleanCommonProps } from "../utils";

export const SelectSingleValue: React.FC<SingleValueProps<SelectOption>> = (props) => {
	const { children, isDisabled, ...innerProps } = cleanCommonProps(props);

	return (
		<div className={`row-[1/2] col-[1/3] ${isDisabled ? "text-white-200" : "text-white"}`} {...innerProps}>
			{children}
		</div>
	);
};

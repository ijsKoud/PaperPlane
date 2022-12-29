import type React from "react";
import type { MenuProps } from "react-select";
import type { SelectOption } from "../types";
import { cleanCommonProps } from "../utils";

export const SelectMenuComponent: React.FC<MenuProps<SelectOption>> = (props) => {
	const { children, innerRef, innerProps } = cleanCommonProps(props);
	return (
		<div
			className="top-full absolute overflow-x-hidden overflow-y-auto w-full z-10 bg-[#292a36] rounded-xl shadow-md my-2 box-border border border-highlight-600"
			ref={innerRef}
			{...innerProps}
		>
			{children}
		</div>
	);
};

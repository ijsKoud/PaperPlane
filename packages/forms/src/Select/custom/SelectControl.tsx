import type React from "react";
import type { ControlProps } from "react-select";
import type { SelectOption } from "../types";
import { cleanCommonProps } from "../utils";

export const SelectControl: React.FC<ControlProps<SelectOption>> = (props) => {
	const { children, isDisabled, isFocused, innerRef, menuIsOpen, innerProps } = cleanCommonProps(props);

	const focusedClass = isFocused || menuIsOpen ? "outline-highlight" : "outline-transparent";
	const disabledClass = isDisabled ? "bg-white-100 border-white-200 cursor-not-allowed" : "bg-highlight-200 border-highlight-600 cursor-pointer";

	return (
		<div
			ref={innerRef}
			className={`flex flex-wrap  justify-between items-center relative rounded-xl bg-highlight-200 border min-h-[38px] box-border transition-all outline outline-2 ${focusedClass} ${disabledClass}`}
			{...innerProps}
		>
			{children}
		</div>
	);
};

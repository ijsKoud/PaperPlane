import type React from "react";
import type { OptionProps } from "react-select";

export const SelectOption: React.FC<OptionProps> = (props) => {
	const { children, isDisabled, isFocused, isSelected, innerRef, innerProps } = props;

	return (
		<div
			className={`cursor-pointer w-full px-3 py-2 box-border ${
				isSelected ? "bg-highlight-400" : isFocused ? "bg-white-200" : "bg-transparent"
			} transition-colors`}
			aria-disabled={isDisabled}
			ref={innerRef}
			{...innerProps}
		>
			{children}
		</div>
	);
};

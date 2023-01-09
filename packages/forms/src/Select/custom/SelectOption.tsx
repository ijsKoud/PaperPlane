import type React from "react";
import type { OptionProps } from "react-select";
import type { MenuProps } from "../SelectMenu";
import type { SelectOption as SelectOptionType } from "../types";
import { cleanCommonProps, SelectMenuStyles } from "../utils";

type Props = { style: MenuProps["type"] } & OptionProps<SelectOptionType>;

export const SelectOption: React.FC<Props> = (props) => {
	const { children, isDisabled, isFocused, isSelected, innerRef, innerProps } = cleanCommonProps(props);
	const styles = SelectMenuStyles[props.style];

	return (
		<div
			className={`cursor-pointer w-full px-3 py-2 box-border ${
				isSelected ? styles.SelectOption : isFocused ? "bg-white-200" : "bg-transparent"
			} transition-colors`}
			aria-disabled={isDisabled}
			ref={innerRef}
			{...innerProps}
		>
			{children}
		</div>
	);
};

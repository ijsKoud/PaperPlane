import type React from "react";
import type { ControlProps } from "react-select";
import type { MenuProps } from "../SelectMenu";
import type { SelectOption } from "../types";
import { cleanCommonProps, SelectMenuStyles } from "../utils";

type Props = MenuProps & ControlProps<SelectOption>;

export const SelectControl: React.FC<Props> = (props) => {
	const { children, isDisabled, isFocused, innerRef, menuIsOpen, innerProps } = cleanCommonProps(props);
	const styles = SelectMenuStyles[props.type];

	const focusedClass = isFocused || menuIsOpen ? styles.selectControl.focused : "outline-transparent";
	const disabledClass = isDisabled ? "bg-white-100 border-white-200 cursor-not-allowed" : `${styles.selectControl.disabled} cursor-pointer`;

	return (
		<div
			ref={innerRef}
			className={`flex flex-wrap py-1 px-2 justify-between items-center relative rounded-xl ${styles.selectControl.default} border min-h-[38px] box-border transition-all outline outline-2 ${focusedClass} ${disabledClass}`}
			{...innerProps}
		>
			{children}
		</div>
	);
};

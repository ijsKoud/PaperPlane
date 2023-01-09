import type React from "react";
import type { MenuProps } from "react-select";
import type { SelectOption } from "../types";
import { cleanCommonProps, SelectMenuStyles } from "../utils";
import type { MenuProps as MenuPropsB } from "../SelectMenu";

type Props = MenuProps<SelectOption> & MenuPropsB;

export const SelectMenuComponent: React.FC<Props> = (props) => {
	const { children, innerRef, innerProps } = cleanCommonProps(props);
	const styles = SelectMenuStyles[props.type];

	return (
		<div
			className={`top-full absolute overflow-x-hidden overflow-y-auto w-full z-10 rounded-xl shadow-md my-2 box-border border ${styles.selectMenuComponent}`}
			ref={innerRef}
			{...innerProps}
		>
			{children}
		</div>
	);
};

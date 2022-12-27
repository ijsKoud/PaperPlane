import type React from "react";
import type { MenuProps } from "react-select";

export const SelectMenuComponent: React.FC<MenuProps> = (props) => {
	const { children, innerRef, innerProps } = props;
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

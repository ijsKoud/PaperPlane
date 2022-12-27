import type React from "react";
import type { DropdownIndicatorProps } from "react-select";
import { components } from "react-select";

export const SelectDropdownIndicator: React.FC<DropdownIndicatorProps> = (props) => {
	const { isDisabled, isFocused } = props;

	return (
		<div
			className={`grid place-items-center p-2 ${
				isFocused && !isDisabled ? "text-white rotate-180" : "text-white-500 rotate-0"
			} transition-all hover:text-white`}
		>
			<components.DownChevron />
		</div>
	);
};

import type React from "react";
import type { DropdownIndicatorProps } from "react-select";
import { components } from "react-select";
import type { MenuProps } from "../SelectMenu";
import type { SelectOption } from "../types";
import { cleanCommonProps } from "../utils";

type Props = MenuProps & DropdownIndicatorProps<SelectOption>;

export const SelectDropdownIndicator: React.FC<Props> = (props) => {
	const { isDisabled, isFocused } = cleanCommonProps(props);

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

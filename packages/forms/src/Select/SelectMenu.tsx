import type React from "react";
import ReactSelect, { Props } from "react-select";
import { SelectInput, SelectControl, SelectMenuComponent, SelectOption, SelectDropdownIndicator, SelectSingleValue } from "./custom";
import type { SelectOption as SelectOptionType } from "./types";

export const SelectMenu: React.FC<Props<SelectOptionType>> = (props) => {
	return (
		<ReactSelect
			{...props}
			components={{
				Input: SelectInput,
				Control: SelectControl,
				Menu: SelectMenuComponent,
				Option: SelectOption,
				DropdownIndicator: SelectDropdownIndicator,
				SingleValue: SelectSingleValue,
				IndicatorSeparator: null
			}}
			classNames={{
				clearIndicator: () => "!text-white hover:!text-white-500",
				placeholder: () => "!text-white-600",
				multiValue: () => "!bg-highlight-400",
				multiValueLabel: () => "!text-white",
				multiValueRemove: () => "!bg-transparent text-white hover:text-red transition-colors"
			}}
			styles={{
				input: (base) => ({ ...base, color: "#fff" })
			}}
		/>
	);
};

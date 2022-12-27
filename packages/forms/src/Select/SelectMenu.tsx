import type React from "react";
import ReactSelect from "react-select";
import { SelectInput, SelectControl, SelectMenuComponent, SelectOption, SelectDropdownIndicator } from "./custom";

export const SelectMenu: React.FC = () => {
	return (
		<ReactSelect
			options={[
				{ label: "hello", value: "world" },
				{ label: "hello1", value: "world1" },
				{ label: "hello1", value: "world1" },
				{ label: "hello1", value: "world1" },
				{ label: "hello1", value: "world1" },
				{ label: "hello1", value: "world1" },
				{ label: "hello1", value: "world1" },
				{ label: "hello1", value: "world1" },
				{ label: "hello1", value: "world1" },
				{ label: "hello1", value: "world1" }
			]}
			menuIsOpen
			components={{
				Input: SelectInput,
				Control: SelectControl,
				Menu: SelectMenuComponent,
				Option: SelectOption,
				DropdownIndicator: SelectDropdownIndicator,
				IndicatorSeparator: null
			}}
		/>
	);
};

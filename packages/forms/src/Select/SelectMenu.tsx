import type React from "react";
import ReactSelect from "react-select";
import { SelectInput, SelectControl, SelectMenuComponent, SelectOption, SelectDropdownIndicator, SelectSingleValue } from "./custom";

export const SelectMenu: React.FC = () => {
	return (
		<ReactSelect
			options={[
				{ label: "hello", value: "world" },
				{ label: "hello1", value: "world1" },
				{ label: "hello2", value: "world2" },
				{ label: "hello3", value: "world3" },
				{ label: "hello4", value: "world4" },
				{ label: "hello5", value: "world5" },
				{ label: "hello6", value: "world6" },
				{ label: "hello7", value: "world7" },
				{ label: "hello8", value: "world8" },
				{ label: "hello9", value: "world9" }
			]}
			isMulti
			components={{
				Input: SelectInput,
				Control: SelectControl,
				Menu: SelectMenuComponent,
				Option: SelectOption,
				DropdownIndicator: SelectDropdownIndicator,
				SingleValue: SelectSingleValue,
				IndicatorSeparator: null
			}}
			styles={{
				input: (base) => ({ ...base, color: "#fff" })
			}}
		/>
	);
};

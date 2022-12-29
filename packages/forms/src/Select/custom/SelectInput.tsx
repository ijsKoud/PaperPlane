import { InputProps, components } from "react-select";
import type React from "react";
import type { SelectOption } from "../types";

export const SelectInput: React.FC<InputProps<SelectOption>> = (props) => {
	return <components.Input {...props} />;
};

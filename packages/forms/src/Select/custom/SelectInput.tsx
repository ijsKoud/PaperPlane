import { InputProps, components } from "react-select";
import type React from "react";

export const SelectInput: React.FC<InputProps> = (props) => {
	return <components.Input {...props} />;
};

import React from "react";
import Select, { Theme, Props } from "react-select";

const SelectMenu: React.FC<Props<{ label: string; value: any }, false>> = (props) => {
	const setTheme = (theme: Theme): Theme => {
		theme.colors = {
			...theme.colors,
			neutral0: "#14161A",
			neutral10: "#333841",
			neutral20: "rgba(255, 255, 255, 0.2)",
			primary25: "#5865f2",
			primary: "#5865f2",
			neutral80: "#fbfdfe"
		};

		return theme;
	};

	return <Select {...props} theme={setTheme} />;
};

export default SelectMenu;

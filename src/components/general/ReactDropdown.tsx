import React from "react";
import Select, { Theme, Props } from "react-select";

const ReactSelectDropdown: React.FC<Props<{ label: string; value: any }, false>> = (props) => {
	const setTheme = (theme: Theme): Theme => {
		theme.colors = {
			...theme.colors,
			neutral0: "var(--input)",
			neutral10: "var(--bg2-border)",
			neutral20: "rgba(var(--white-rgb), 0.2)",
			primary25: "var(--blurple)",
			primary: "var(--blurple)",
			neutral80: "var(--white)"
		};

		return theme;
	};

	return <Select {...props} theme={setTheme} />;
};

export default ReactSelectDropdown;

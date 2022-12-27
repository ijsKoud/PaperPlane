import type { InputProps } from "react-select";
import type React from "react";

const spacingStyle = {
	gridArea: "1 / 2",
	font: "inherit",
	minWidth: "2px",
	border: 0,
	margin: 0,
	outline: 0,
	padding: 0
} as const;

const inputStyle = (isHidden: boolean) => ({
	label: "input",
	color: "inherit",
	background: 0,
	opacity: isHidden ? 0 : 1,
	width: "100%",
	...spacingStyle
});

export const SelectInput: React.FC<InputProps> = (props) => {
	const { value } = props;
	const { innerRef, isDisabled, isHidden, inputClassName, ...innerProps } = props;

	return (
		<div className="inline-grid row-[1/2] col-[1/3]" data-value={value || ""}>
			<input ref={innerRef} style={inputStyle(isHidden)} disabled={isDisabled} {...innerProps} />
		</div>
	);
};

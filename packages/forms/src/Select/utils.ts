import type { CommonPropsAndClassName, GroupBase } from "react-select";

// === Directly Copied from https://github.com/JedWatson/react-select/blob/c350a124f8de853a79e0158578d438a35e67e63e/packages/react-select/src/utils.ts#L79-L110
export const cleanCommonProps = <Option, IsMulti extends boolean, Group extends GroupBase<Option>, AdditionalProps>(
	props: Partial<CommonPropsAndClassName<Option, IsMulti, Group>> & AdditionalProps
): Omit<AdditionalProps, keyof CommonPropsAndClassName<Option, IsMulti, Group>> => {
	// className
	const {
		className, // not listed in commonProps documentation, needs to be removed to allow Emotion to generate classNames
		clearValue,
		cx,
		getStyles,
		getClassNames,
		getValue,
		hasValue,
		isMulti,
		isRtl,
		options, // not listed in commonProps documentation
		selectOption,
		selectProps,
		setValue,
		theme, // not listed in commonProps documentation
		...innerProps
	} = props;
	return { ...innerProps };
};

export const SelectMenuStyles = {
	tertiary: {
		multiValue: "!bg-highlight-400",
		selectMenuComponent: "border-highlight-600 bg-[#292a36]",
		SelectOption: "bg-highlight-400",
		selectControl: {
			default: "bg-highlight-200",
			disabled: "bg-highlight-200 border-highlight-600",
			focused: "outline-highlight"
		}
	},
	main: {
		multiValue: "!bg-main-400",
		selectMenuComponent: "border-white-100 bg-main",
		SelectOption: "bg-white-100",
		selectControl: {
			default: "bg-main",
			disabled: "bg-main border-white-100",
			focused: "outline-white-400"
		}
	}
};

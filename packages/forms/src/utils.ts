export const InputStyles = {
	tertiary: "bg-highlight-200 border-highlight-600 focus:outline-highlight disabled:bg-white-100 disabled:border-white-200",
	main: "bg-main border-white-100 focus:outline-white-400 disabled:bg-white-100 disabled:border-white-200"
};

export const getCleanProps = (_props: Record<string, any>): Record<string, any> => {
	const { className, type, formType, ...props } = _props;

	return props;
};

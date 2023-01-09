export const InputStyles = {
	tertiary: "bg-highlight-200 border-highlight-600 focus:outline-highlight",
	main: "bg-main border-white-100 focus:outline-white-400"
};

export const getCleanProps = (_props: Record<string, any>): Record<string, any> => {
	const { className, type, ...props } = _props;

	return props;
};

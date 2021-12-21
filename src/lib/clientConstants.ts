import type { Variant } from "framer-motion";

export const defaultVariant: Variant = {
	transition: {
		duration: 0.5,
		ease: [0.25, 0.1, 0.25, 1]
		// ease: [0.6, -0.05, 0.01, 0.99]
	}
};

export const sortTypes = [
	{
		label: "Date: New - Old",
		value: "date-new"
	},
	{
		label: "Date: Old - New",
		value: "date-old"
	},
	{
		label: "Name: A - Z",
		value: "name"
	},
	{
		label: "Name: Z - A",
		value: "name-reverse"
	},
	{
		label: "Size: High - Small",
		value: "bytes-small"
	},
	{
		label: "Size: Small - High",
		value: "bytes-large"
	}
];

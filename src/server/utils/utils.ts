import ShortUniqueId from "short-unique-id";

export const generateId = (): string => {
	// TODO: switch case for multiple different id types

	const id = new ShortUniqueId({ length: 10 });
	return id();
};

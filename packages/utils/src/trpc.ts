import { z } from "zod";

/**
 * Parses the field error message into a JS object
 * @param message The message to parse
 * @returns
 */
export function getTRPCError(message: string) {
	try {
		const json = JSON.parse(message);
		const schema = z.object({ code: z.string(), message: z.string(), field: z.string() });

		const parsed = schema.parse(json);

		// Only return field error if the error comes from an input field
		if (parsed.field.startsWith("input.")) {
			parsed.field = parsed.field.replace("input.", "");
			return parsed;
		}

		return null;
	} catch (error) {
		return null;
	}
}

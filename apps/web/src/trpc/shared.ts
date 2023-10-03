import { getTRPCError } from "@paperplane/utils";
import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import { UseFormReturn } from "react-hook-form";
import type AppRouter from "server/dist/trpc";

/**
 * Inference helper for inputs.
 *
 * @example type HelloInput = RouterInputs['example']['hello']
 */
export type RouterInputs = inferRouterInputs<typeof AppRouter>;

/**
 * Inference helper for outputs.
 *
 * @example type HelloOutput = RouterOutputs['example']['hello']
 */
export type RouterOutputs = inferRouterOutputs<typeof AppRouter>;

/**
 * Error handler for forms using TRPC
 * @param err The error to handle
 * @param form The react-hook-form component
 * @param key The form key to use as fallback for unknown errors
 * @returns
 */
export function HandleTRPCFormError<F extends UseFormReturn<any>>(err: any, form: F, key: string) {
	const parsedError = getTRPCError(err.message);
	if (!parsedError) {
		console.error(err);
		form.setError(key, { message: "Unknown error, please try again later." });
		return;
	}

	const inputField = parsedError.field as any;
	if (Boolean(form.getValues()[inputField])) form.setError(inputField, { message: parsedError.message });
	console.error(parsedError);
}

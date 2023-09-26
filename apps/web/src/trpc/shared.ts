import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
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

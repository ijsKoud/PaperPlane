import type { PrismaClient } from "@prisma/client";

export declare global {
	// eslint-disable-next-line no-var
	var prisma: PrismaClient;
}

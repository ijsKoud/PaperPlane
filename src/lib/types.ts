/* eslint-disable @typescript-eslint/ban-types */
import type { User } from "@prisma/client";
import type React from "react";

export type FC<P = {}> = React.FC<P & { children?: React.ReactNode }>;

export interface ApiError {
	message: string;
	error: string;
}

export interface LoginCreds {
	username: string;
	password: string;
}

export type CleanUser = Omit<User, "password">;

/* eslint-disable @typescript-eslint/ban-types */
import type React from "react";

export type FC<P = {}> = React.FC<P & { children?: React.ReactNode }>;

"use client";

import { ThemeProvider } from "next-themes";
import React from "react";

const Providers: React.FC<React.PropsWithChildren> = ({ children }) => {
	return (
		<ThemeProvider attribute="class" enableSystem defaultTheme="dark">
			{children}
		</ThemeProvider>
	);
};

export default Providers;

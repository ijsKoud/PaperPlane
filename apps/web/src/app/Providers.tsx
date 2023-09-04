"use client";

import { ThemeProvider } from "next-themes";
import { ChangelogProvider } from "@paperplane/components/Context/ChangelogProvider";
import React from "react";

const Providers: React.FC<React.PropsWithChildren> = ({ children }) => {
	return (
		<ThemeProvider attribute="class" enableSystem defaultTheme="dark">
			<ChangelogProvider>{children}</ChangelogProvider>
		</ThemeProvider>
	);
};

export default Providers;

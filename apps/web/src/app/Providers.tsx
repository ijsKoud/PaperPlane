"use client";

import { ThemeProvider } from "next-themes";
import { ChangelogProvider } from "@paperplane/components/Context/ChangelogProvider";
import { Toaster } from "@paperplane/ui/toaster";
import React from "react";

const Providers: React.FC<React.PropsWithChildren> = ({ children }) => {
	return (
		<ThemeProvider attribute="class" enableSystem defaultTheme="dark">
			<Toaster />
			<ChangelogProvider>{children}</ChangelogProvider>
		</ThemeProvider>
	);
};

export default Providers;

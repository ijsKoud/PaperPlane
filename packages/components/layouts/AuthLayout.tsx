import { ThemeToggle } from "@paperplane/components/ThemeToggle";
import type React from "react";

const AuthLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
	return (
		<div className="grid place-items-center h-screen dark:bg-login bg-login-light bg-cover bg-center">
			<main className="dark:bg-neutral-800 border dark:border-zinc-700 bg-white m-2 p-8 rounded-xl flex flex-col gap-y-8 items-center justify-center">
				<div className="fixed top-4 right-4">
					<ThemeToggle />
				</div>

				{children}
			</main>
		</div>
	);
};

export default AuthLayout;

import type React from "react";

const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
	return (
		<div className="grid place-items-center h-screen bg-login bg-cover bg-center">
			<main className="dark:bg-neutral-800 border dark:border-zinc-700 bg-white m-2 p-8 rounded-xl flex flex-col gap-y-8 items-center justify-center">
				{children}
			</main>
		</div>
	);
};

export default Layout;

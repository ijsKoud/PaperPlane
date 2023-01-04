import { PrimaryButton, TransparentButton } from "@paperplane/buttons";
import type React from "react";

interface Props {
	closeMenu: () => void;
	active: boolean;
	openChangelog: () => void;
}

export const MobileMenu: React.FC<Props> = ({ active, closeMenu, openChangelog }) => {
	const changelogButton = () => {
		closeMenu();
		openChangelog();
	};

	return (
		<div className={`bg-main w-screen h-screen z-10 left-0 top-0 ${active ? "fixed" : "hidden"}`}>
			<div className="absolute top-20 flex flex-col px-4 w-full gap-4">
				<TransparentButton type="button" onClick={changelogButton}>
					<p className="text-lg font-normal text-left">Changelog</p>
				</TransparentButton>
				<TransparentButton type="link" href="https://paperplane.ijskoud.dev/" onClick={closeMenu}>
					<p className="text-lg font-normal">Help</p>
				</TransparentButton>
				<TransparentButton type="link" href="/settings" onClick={closeMenu}>
					<p className="text-lg font-normal">Settings</p>
				</TransparentButton>
				<PrimaryButton type="button">
					<p className="w-full">Logout</p>
				</PrimaryButton>
			</div>
		</div>
	);
};

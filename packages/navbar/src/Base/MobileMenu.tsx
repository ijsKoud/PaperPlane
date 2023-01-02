import { PrimaryButton, TransparentButton } from "@paperplane/buttons";
import type React from "react";

interface Props {
	closeMenu: () => void;
	active: boolean;
}

export const MobileMenu: React.FC<Props> = ({ active, closeMenu }) => {
	return (
		<div className={`bg-main w-screen h-screen z-10 left-0 top-0 ${active ? "fixed" : "hidden"}`}>
			<div className="absolute top-20 flex flex-col px-4 w-full gap-4">
				<TransparentButton type="button">
					<p className="text-lg font-normal text-left">Changelog</p>
				</TransparentButton>
				<TransparentButton type="link" href="https://paperplane.ijskoud.dev/">
					<p className="text-lg font-normal">Help</p>
				</TransparentButton>
				<PrimaryButton type="button">
					<p className="w-full">Logout</p>
				</PrimaryButton>
			</div>
		</div>
	);
};

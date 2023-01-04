import type React from "react";
import { useState } from "react";
import { MobileMenu } from "./MobileMenu";

interface Props {
	openChangelog: () => void;
}

export const MenuButton: React.FC<Props> = ({ openChangelog }) => {
	const [active, setActive] = useState(false);

	const onClick = () => setActive(!active);
	const closeMenu = () => setActive(false);

	return (
		<>
			<MobileMenu active={active} closeMenu={closeMenu} openChangelog={openChangelog} />
			<button onClick={onClick} className="relative cursor-pointer w-6 h-8 z-20">
				<div className={`w-6 h-[2px] transition-all absolute right-0 bg-white -translate-y-1 ${active && "rotate-45 !translate-y-[1px]"}`} />
				<div
					className={`w-4 h-[2px] transition-all absolute right-0 bg-white translate-y-1 ${active && "-rotate-45 !translate-y-[1px] !w-6"}`}
				/>
			</button>
		</>
	);
};

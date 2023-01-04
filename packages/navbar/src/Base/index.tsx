import { Logo } from "@paperplane/logo";
import { TransparentButton } from "@paperplane/buttons";
import type React from "react";
import UserButton from "./UserButton";
import { MenuButton } from "./MenuButton";
import { Modal } from "@paperplane/modal";
import { useState } from "react";
import ChangelogModal from "../modals/ChangelogModal";
import UserDropdown from "./UserDropdown";
import { AnimatePresence } from "framer-motion";

export const BaseNavbar: React.FC = () => {
	const [ChangelogOpen, setChangelogOpen] = useState(false);
	const openChangelog = () => setChangelogOpen(true);
	const closeChangelog = () => setChangelogOpen(false);

	const [userDropdown, setUserDropdown] = useState(false);
	const toggleUserDropdown = () => setUserDropdown(!userDropdown);
	const closeUserDropdown = () => setUserDropdown(false);

	return (
		<>
			<Modal isOpen={ChangelogOpen} onClick={closeChangelog}>
				<ChangelogModal />
			</Modal>
			<div className="py-2 px-5 w-screen flex justify-between bg-main">
				<div className="flex gap-2 items-center z-50">
					<Logo height={20} width={20} />
					<h1 className="text-lg">PAPERPLANE</h1>
				</div>
				<div className="flex gap-4 items-center max-sm:hidden">
					<TransparentButton type="button" onClick={openChangelog}>
						Changelog
					</TransparentButton>
					<TransparentButton type="link" href="https://paperplane.ijskoud.dev/">
						Help
					</TransparentButton>
					<div className="relative">
						<UserButton type="button" onClick={toggleUserDropdown} />
						<AnimatePresence mode="wait">{userDropdown && <UserDropdown onClick={closeUserDropdown} />}</AnimatePresence>
					</div>
				</div>
				<div className="sm:hidden gap-4 items-center flex">
					<MenuButton openChangelog={openChangelog} />
				</div>
			</div>
		</>
	);
};

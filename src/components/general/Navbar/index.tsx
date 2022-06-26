import React, { useEffect, useState } from "react";
import type { FC } from "../../../lib/types";
import Button from "../Button";
import MenuButton from "./MenuButton";
import { motion, useAnimation, Variants } from "framer-motion";
import { useRouter } from "next/router";
import { useAuth } from "../../../lib/hooks/useAuth";
import UploadModal from "./modals/Upload";
import CreateModal from "./modals/Create";

const variants: Variants = {
	hidden: {
		pointerEvents: "none",
		opacity: 0,
		transform: "translateY(-10px)",
		transition: {
			duration: 0.5,
			ease: [0.6, 0, 0.17, 1]
		}
	},
	visible: {
		pointerEvents: "all",
		opacity: 1,
		transform: "translateY(0px)",
		transition: {
			duration: 0.5,
			ease: [0.6, 0, 0.17, 1]
		}
	}
};

const Navbar: FC = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [isMobile, setIsMobile] = useState(false);

	const [isUploadOpen, setIsUploadOpen] = useState(false);
	const closeUpload = () => setIsUploadOpen(false);
	const openUpload = () => {
		setIsUploadOpen(true);
		setIsOpen(false);
	};

	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const closeCreate = () => setIsCreateOpen(false);
	const openCreate = () => {
		setIsCreateOpen(true);
		setIsOpen(false);
	};

	const controller = useAnimation();
	const router = useRouter();
	const { fetch } = useAuth();

	const toggleMenu = () => setIsOpen(!isOpen);
	const closeMenu = () => setIsOpen(false);

	const logout = () => {
		closeMenu();
		localStorage.removeItem("PAPERPLANE_AUTH");

		fetch();
		void router.push("/");
	};

	useEffect(() => {
		const update = () => setIsMobile(window.innerWidth < 600);
		window.addEventListener("resize", update);

		return () => window.removeEventListener("resize", update);
	}, []);

	useEffect(() => {
		if (isOpen) void controller.start("visible");
		else void controller.start("hidden");

		return () => controller.stop();
	}, [isOpen]);

	return (
		<>
			<UploadModal isOpen={isUploadOpen} onClick={closeUpload} />
			<CreateModal isOpen={isCreateOpen} onClick={closeCreate} />
			<div className="navbar-container-wrapper">
				<div className="navbar-container">
					<div className="navbar-content">
						<img alt="paperplane logo" src="assets/svg/paperplane_nobg.svg" />
						{!isMobile && (
							<>
								<Button type="link" style="text" url="/dasboard" text="Dashboard" />
								<Button type="link" style="text" url="/settings" text="Settings" />
							</>
						)}
					</div>
					<div className="navbar-dropdown">
						<MenuButton onClick={toggleMenu} isOpen={isOpen} />
						<motion.div variants={variants} initial="hidden" animate={controller} className="navbar-dropdown-content">
							{isMobile && (
								<>
									<Button onClick={closeMenu} type="link" style="text" url="/dasboard">
										<i className="fa-solid fa-chart-line" /> Dashboard
									</Button>
									<Button onClick={closeMenu} type="link" style="text" url="/settings">
										<i className="fa-solid fa-gear" /> Settings
									</Button>
								</>
							)}
							<Button onClick={openUpload} type="button" style="text">
								<i className="fa-solid fa-cloud-arrow-up" /> Upload
							</Button>
							<Button onClick={openCreate} type="button" style="text">
								<i className="fa-solid fa-link" /> Create
							</Button>
							<div className="navbar-dropdown-border" />
							<Button onClick={logout} type="button" style="text">
								<i className="fa-solid fa-arrow-right-from-bracket" /> Logout
							</Button>
						</motion.div>
					</div>
				</div>
			</div>
		</>
	);
};

export default Navbar;

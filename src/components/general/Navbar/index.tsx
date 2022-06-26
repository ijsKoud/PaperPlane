import React, { useEffect, useState } from "react";
import type { FC } from "../../../lib/types";
import Button from "../Button";
import MenuButton from "./MenuButton";

const Navbar: FC = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [isMobile, setIsMobile] = useState(false);

	const toggleMenu = () => setIsOpen(!isOpen);
	// const closeMenu = () => setIsOpen(false);

	useEffect(() => {
		const update = () => setIsMobile(window.innerWidth < 600);
		window.addEventListener("resize", update);

		return () => window.removeEventListener("resize", update);
	}, []);

	return (
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
					<div className="navbar-dropdown-content">
						{isMobile && (
							<>
								<Button type="link" style="text" url="/dasboard">
									<i className="fa-solid fa-chart-line" /> Dashboard
								</Button>
								<Button type="link" style="text" url="/settings">
									<i className="fa-solid fa-gear" /> Settings
								</Button>
							</>
						)}
						<Button type="link" style="text" url="/settings">
							<i className="fa-solid fa-cloud-arrow-up" /> Upload
						</Button>
						<Button type="link" style="text" url="/settings">
							<i className="fa-solid fa-link" /> Create
						</Button>
						<div className="navbar-dropdown-border" />
						<Button type="link" style="text" url="/settings">
							<i className="fa-solid fa-arrow-right-from-bracket" /> Logout
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Navbar;

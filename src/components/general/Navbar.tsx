import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

const Navbar: React.FC = () => {
	const [dropdownActive, setDropdownActive] = useState(false);

	const closeDropdown = () => setDropdownActive(false);
	const toggleDropdown = () => setDropdownActive(!dropdownActive);

	return (
		<nav className="navbar">
			<div className="navbar-logo">
				<Image src="/assets/svg/paperplane.svg" alt="Logo" width={70} height={70} />
				<h1>PaperPlane</h1>
			</div>
			<div className="navbar-user">
				<button onClick={toggleDropdown}>
					<i className="fas fa-user" /> <p>DaanGamesDG</p>
				</button>
				<ul className={dropdownActive ? "navbar-dropdown active" : "navbar-dropdown"}>
					<NavLink closeDropdown={closeDropdown} name="Home" icon="fas fa-home" path="/dashboard" />
					<NavLink closeDropdown={closeDropdown} name="Upload" icon="fas fa-upload" path="/upload" />
					<NavLink closeDropdown={closeDropdown} name="Settings" icon="fas fa-cog" path="/settings" />
					<li className="navbar-dropdown-item">
						<Link href="/dashboard">
							<a onClick={closeDropdown}>
								<i className="fas fa-sign-out-alt" /> Logout
							</a>
						</Link>
					</li>
				</ul>
			</div>
		</nav>
	);
};

interface Props {
	closeDropdown: () => void;
	path: string;
	name: string;
	icon: string;
}

const NavLink: React.FC<Props> = ({ closeDropdown, path, name, icon }) => (
	<li className="navbar-dropdown-item">
		<Link href={path}>
			<a onClick={closeDropdown}>
				<i className={icon} /> {name}
			</a>
		</Link>
	</li>
);

export default Navbar;

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { useAuth } from "../../lib/hooks/useAuth";
import PulseLoader from "./PulseLoader";

const Navbar: React.FC = () => {
	const { user, loading, fetch } = useAuth();
	const [dropdownActive, setDropdownActive] = useState(false);

	const closeDropdown = () => setDropdownActive(false);
	const toggleDropdown = () => setDropdownActive(!dropdownActive);

	const logout = () => {
		if (localStorage) localStorage.removeItem("PAPERPLANE_AUTH");
		closeDropdown();
		fetch(true);
	};

	return (
		<nav className="navbar">
			<div className="navbar-logo">
				<Image src="/assets/svg/paperplane.svg" alt="Logo" width={70} height={70} />
				<h1>PaperPlane</h1>
			</div>
			{loading ? (
				<PulseLoader />
			) : user ? (
				<div className="navbar-user">
					<button onClick={toggleDropdown}>
						<i className="fas fa-user" /> <p>{user.username}</p>
					</button>
					<ul className={dropdownActive ? "navbar-dropdown active" : "navbar-dropdown"}>
						<NavLink closeDropdown={closeDropdown} name="Home" icon="fas fa-home" path="/dashboard" />
						<NavLink closeDropdown={closeDropdown} name="Upload" icon="fas fa-upload" path="/upload" />
						<NavLink closeDropdown={closeDropdown} name="Settings" icon="fas fa-cog" path="/settings" />
						<li className="navbar-dropdown-item">
							<button onClick={logout}>
								<i className="fas fa-sign-out-alt" /> Logout
							</button>
						</li>
					</ul>
				</div>
			) : (
				<Link href="/login">
					<a className="navbar-login">
						<i className="fas fa-sign-in-alt" /> Login
					</a>
				</Link>
			)}
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

import React, { useState } from "react";
import Link from "next/link";

const Dropdown: React.FC<{ user: string }> = ({ user }) => {
	const [dropdown, setDropdown] = useState(false);

	const closeDropdown = () => setDropdown(false);
	const updateDropdown = () => setDropdown(!dropdown);

	return (
		<div className="navbar-dropdown">
			<p className="navbar__dropdown-button" onClick={updateDropdown}>
				<i className="fas fa-user" /> {user}
			</p>
			<div className={dropdown ? "navbar__dropdown-items active" : "navbar__dropdown-items"}>
				<Link href="/dashboard">
					<a className="navbar__dropdown-link" onClick={closeDropdown}>
						<i className="fas fa-home" /> Home
					</a>
				</Link>
				<Link href="/upload">
					<a className="navbar__dropdown-link" onClick={closeDropdown}>
						<i className="fas fa-upload" /> Upload
					</a>
				</Link>
				<Link href="/settings">
					<a className="navbar__dropdown-link" onClick={closeDropdown}>
						<i className="fas fa-cog" /> Settings
					</a>
				</Link>
				<div className="separator" />
				<Link href="/logout">
					<a className="navbar__dropdown-link" onClick={closeDropdown}>
						<i className="fas fa-sign-out-alt" /> Logout
					</a>
				</Link>
			</div>
		</div>
	);
};

export default Dropdown;

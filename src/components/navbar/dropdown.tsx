import React, { useState } from "react";
import Link from "next/link";
import { useCookies } from "react-cookie";
import { useAuth } from "../../lib/hooks/useAuth";
import { useRouter } from "next/router";
import { fetch } from "../../lib/fetch";

const Dropdown: React.FC<{ user: string }> = ({ user }) => {
	const [dropdown, setDropdown] = useState(false);
	const [, , removeCookie] = useCookies(["session"]);
	const auth = useAuth();
	const router = useRouter();

	const closeDropdown = () => setDropdown(false);
	const updateDropdown = () => setDropdown(!dropdown);

	const handleLogout = async () => {
		await fetch("/auth/logout", {
			method: "DELETE",
			withCredentials: true,
		}).catch(() => void 0);

		removeCookie("session");
		auth.fetch(true);
		router.push("/");
		closeDropdown();
	};

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
				<button className="navbar__dropdown-link" onClick={handleLogout}>
					<i className="fas fa-sign-out-alt" /> Logout
				</button>
			</div>
		</div>
	);
};

export default Dropdown;

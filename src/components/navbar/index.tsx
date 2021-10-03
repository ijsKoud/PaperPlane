import React from "react";
import { useAuth } from "../../lib/hooks/useAuth";
import Dropdown from "./dropdown";
import Link from "next/link";

const Navbar: React.FC = () => {
	const { user, loading } = useAuth();

	return (
		<nav className="navbar">
			<div className="navbar-logo">
				<i className="fas fa-paper-plane" /> <p>PaperPlane</p>
			</div>
			{loading ? (
				<p style={{ fontSize: "1.5rem" }}>loading...</p>
			) : user ? (
				<Dropdown user={user.username} />
			) : (
				<Link href="/login">
					<a style={{ fontSize: "1.5rem" }}>
						<i className="fas fa-sign-in-alt" /> Login
					</a>
				</Link>
			)}
		</nav>
	);
};

export default Navbar;

import Tippy from "@tippyjs/react";
import { NextPage } from "next";
import Head from "next/head";
import React, { useState } from "react";
import { isMobile } from "react-device-detect";
import Loading from "../components/loading";
import Modal from "../components/modal";
import Unauthorized from "../components/pages/errors/401";
import EditNameModal from "../components/pages/settings/editNameModal";
import { useAuth } from "../lib/hooks/useAuth";

const Settings: NextPage = () => {
	const { loading, user } = useAuth();
	const [showToken, setShowToken] = useState(false);

	const [editNameOpen, setEditNameOpen] = useState(false);

	return (
		<>
			<Head>
				<title>PaperPlane - Settings</title>
			</Head>
			{loading ? (
				<Loading />
			) : user ? (
				<main className="settings">
					<Modal onClick={() => setEditNameOpen(false)} isOpen={editNameOpen}>
						<EditNameModal handleClose={() => setEditNameOpen(false)} />
					</Modal>
					<h1>
						<i className="fas fa-cog" /> User Settings
					</h1>
					<div className="settings-container">
						<div className="settings-component">
							<h3>Username:</h3>
							<p>{user.username}</p>
							<button onClick={() => setEditNameOpen(true)}>Change name</button>
						</div>
						<div className="separator sep-settings" />
						<div className="settings-component">
							<h3>Password</h3>
							<button>Change password</button>
						</div>
						<div className="separator sep-settings" />
						<div className="settings-component">
							<h3>User token:</h3>
							<Tippy duration={5e2} disabled={isMobile || showToken} content={<p>Show token</p>}>
								<p
									className={showToken ? "token show" : "token"}
									onClick={() => setShowToken(true)}>
									{user.token}
								</p>
							</Tippy>
							<div>
								<button>Copy</button>
								<button className="danger">Regenerate</button>
							</div>
						</div>
						<div className="separator sep-settings" />
						<div className="settings-component">
							<h3>Theme:</h3>
							<p>{user.theme}</p>
							<button>Change theme</button>
						</div>
					</div>
				</main>
			) : (
				<Unauthorized />
			)}
		</>
	);
};

export default Settings;

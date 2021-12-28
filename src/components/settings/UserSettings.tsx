import copy from "copy-to-clipboard";
import React, { useState } from "react";
import { isMobile } from "react-device-detect";
import { useAuth } from "../../lib/hooks/useAuth";
import { info } from "../../lib/notifications";
import Modal from "../general/modal";
import ToolTip from "../general/ToolTip";
import EditNameModal from "./modals/EditNameModal";
import EditPasswordModal from "./modals/EditPasswordModal";
import EditThemeModal from "./modals/EditThemeModal";
import GenerateTokenModal from "./modals/GenerateTokenModal";

const UserSettings: React.FC = () => {
	const { user } = useAuth();
	const [showToken, setShowToken] = useState(false);

	const [editName, setEditName] = useState(false);
	const [editPassword, setEditPassword] = useState(false);
	const [editTheme, setEditTheme] = useState(false);
	const [generateToken, setGenerateToken] = useState(false);

	const copyToken = () => {
		copy(user?.token ?? "");
		info("Copied to clipboard", "Token copied to clipboard");
	};

	const handleClose = () => {
		setGenerateToken(false);
		setShowToken(false);
	};

	return user ? (
		<>
			<Modal onClick={() => setEditName(false)} isOpen={editName}>
				<EditNameModal handleClose={() => setEditName(false)} />
			</Modal>
			<Modal onClick={() => setEditPassword(false)} isOpen={editPassword}>
				<EditPasswordModal handleClose={() => setEditPassword(false)} />
			</Modal>
			<Modal onClick={() => setEditTheme(false)} isOpen={editTheme}>
				<EditThemeModal handleClose={() => setEditTheme(false)} />
			</Modal>
			<Modal onClick={() => setGenerateToken(false)} isOpen={generateToken}>
				<GenerateTokenModal handleClose={handleClose} />
			</Modal>
			<h1>
				<i className="fas fa-cog" /> User Settings
			</h1>
			<div className="settings-container">
				<div className="settings-component">
					<h3>Username:</h3>
					<p>{user.username}</p>
					<button onClick={() => setEditName(true)}>Change name</button>
				</div>
				<div className="separator sep-settings" />
				<div className="settings-component">
					<h3>Password</h3>
					<button onClick={() => setEditPassword(true)}>Change password</button>
				</div>
				<div className="separator sep-settings" />
				<div className="settings-component">
					<h3>User token:</h3>
					<ToolTip isMobile={isMobile || showToken} content="Show token">
						<p className={showToken ? "token show" : "token"} onClick={() => setShowToken(true)}>
							{user.token}
						</p>
					</ToolTip>
					<div>
						<button onClick={copyToken}>Copy</button>
						<button className="danger" onClick={() => setGenerateToken(true)}>
							Regenerate
						</button>
					</div>
				</div>
				<div className="separator sep-settings" />
				<div className="settings-component">
					<h3>Theme:</h3>
					<p>{user.theme}</p>
					<button onClick={() => setEditTheme(true)}>Change theme</button>
				</div>
			</div>
		</>
	) : (
		<div></div>
	);
};

export default UserSettings;

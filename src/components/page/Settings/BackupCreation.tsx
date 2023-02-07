import React from "react";
import { toast } from "react-toastify";
import { fetch } from "../../../lib/fetch";
import { useAuth } from "../../../lib/hooks/useAuth";
import Button from "../../general/Button";

const BackupCreation: React.FC = () => {
	const { user } = useAuth();

	const createBackup = async () => {
		const promise = () => fetch("/api/backup/create", undefined, { method: "POST" });

		try {
			await toast.promise(promise(), {
				pending: "Creating backup...",
				success: "Backup created, you can now use the backup in v4!",
				error: "Unable to create a backup, check the server logs for more information."
			});
		} catch (err) {
			console.log(err);
		}
	};

	return user ? (
		<div className="settings-container">
			<div className="embed-settings-wrapper">
				<h2>Create Backup</h2>
				<Button type="button" style="blurple" onClick={createBackup}>
					<i className="fas fa-download" /> Create
				</Button>
			</div>
		</div>
	) : (
		<div></div>
	);
};

export default BackupCreation;

import { DangerButton } from "@paperplane/buttons";
import type React from "react";
import { useState } from "react";
import { ConfirmModal } from "../../index";

interface Props {
	createBackup: () => Promise<void>;
	backupModal: () => void;
}

export const AdminBackups: React.FC<Props> = ({ createBackup: _createBackup, backupModal }) => {
	const [backupCreateModal, setBackupCreateModal] = useState(false);
	const createBackup = async () => {
		await _createBackup();
		setBackupCreateModal(false);
	};

	return (
		<>
			<ConfirmModal cancel={() => setBackupCreateModal(false)} confirm={createBackup} isOpen={backupCreateModal} />
			<div className="max-w-[50vw] max-xl:max-w-[75vw] max-md:max-w-[100vw] w-full">
				<div className="w-full">
					<h1 className="text-xl">Backups</h1>
					<p className="text-base">
						You can make a backup any time, we currently do not support automatic backups. You can find the backup files in the{" "}
						<strong>/backups</strong> directory on the server. To import a backup, move one to the folder or use an already created
						backup, press the import backup button and select it from the list.
					</p>
				</div>
				<div className="w-full mt-4 flex items-center gap-2">
					<DangerButton type="button" onClick={() => setBackupCreateModal(true)}>
						Create Backup
					</DangerButton>
					<DangerButton type="button" onClick={backupModal}>
						Import Backup
					</DangerButton>
				</div>
			</div>
		</>
	);
};

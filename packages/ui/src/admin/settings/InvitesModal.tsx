import { PrimaryButton, TransparentButton } from "@paperplane/buttons";
import { Modal } from "@paperplane/modal";
import { useSwrWithUpdates } from "@paperplane/swr";
import { formatDate, Invite, InviteGetApi } from "@paperplane/utils";
import type React from "react";
import { useEffect, useState } from "react";
import { Table, TableEntry } from "../../index";

interface Props {
	isOpen: boolean;
	onClick: () => void;

	toastSuccess: (str: string) => void;
	deleteInvite: (invites: string[]) => Promise<void>;
	createInvite: () => Promise<Invite | undefined>;
}

export const InvitesModal: React.FC<Props> = ({ isOpen, onClick, deleteInvite, createInvite, toastSuccess }) => {
	const [selected, setSelected] = useState<string[]>([]);
	const [invites, setInvites] = useState<InviteGetApi>({ entries: [], pages: 0 });
	const { data: invitesGetData, mutate } = useSwrWithUpdates<InviteGetApi>("/api/invites/list");

	useEffect(() => {
		if (invitesGetData) setInvites(invitesGetData);
	}, [invitesGetData]);

	const onCreateClick = async () => {
		const invite = await createInvite();
		if (invite) await mutate();
	};

	const copyClipboard = (str: string) => {
		navigator.clipboard.writeText(str);
		toastSuccess("Copied to clipboard!");
	};

	const onSelectClick = (invite: string) => {
		if (selected.includes(invite)) setSelected(selected.filter((inv) => inv !== invite));
		else setSelected([invite, ...selected]);
	};

	const onSingleDelete = async (invite: string) => {
		await deleteInvite([invite]);
		await mutate();
	};

	return (
		<Modal onClick={onClick} isOpen={isOpen}>
			<div className="w-[60vw] max-xl:w-[80vw]">
				<h1 className="text-3xl">Invite Codes</h1>
				<div className="max-h-[45vh] overflow-auto w-full">
					<Table className="w-full" colgroups={[325, 300, 100]} headPosition="left" heads={["Code", "Date", "Options"]}>
						{invites.entries.map((invite) => (
							<TableEntry key={invite.invite}>
								<td>
									<p title={invite.invite} className="max-w-[300px] overflow-hidden whitespace-nowrap text-ellipsis">
										{invite.invite}
									</p>
								</td>
								<td>{formatDate(invite.date)}</td>
								<td className="flex items-center gap-2">
									<TransparentButton type="button" onClick={() => copyClipboard(invite.invite)}>
										<i className="fa-solid fa-copy text-base" />
									</TransparentButton>
									<TransparentButton type="button" onClick={() => void onSingleDelete(invite.invite)}>
										<i className="fa-solid fa-trash-can text-base" />
									</TransparentButton>
									<input type="checkbox" checked={selected.includes(invite.invite)} onChange={() => onSelectClick(invite.invite)} />
								</td>
							</TableEntry>
						))}
					</Table>
				</div>
				<div className="mt-4">
					<PrimaryButton type="button" onClick={onCreateClick}>
						Create Invite
					</PrimaryButton>
				</div>
			</div>
		</Modal>
	);
};

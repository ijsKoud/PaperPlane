import { DangerButton, PrimaryButton, TransparentButton } from "@paperplane/buttons";
import { SelectMenu, SelectOption } from "@paperplane/forms";
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
	const [page, setPage] = useState(0);
	const [selected, setSelected] = useState<string[]>([]);
	const [invites, setInvites] = useState<InviteGetApi>({ entries: [], pages: 0 });
	const { data: invitesGetData, mutate } = useSwrWithUpdates<InviteGetApi>(`/api/invites/list?page=${page}`, { refreshInterval: isOpen ? 5e3 : 0 });

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

	const onBulkDelete = async () => {
		await deleteInvite(selected);
		await mutate();
	};

	const pageOptions: SelectOption[] = Array(invites.pages)
		.fill(null)
		.map((_, key) => ({ label: `Page ${key + 1}`, value: key.toString() }));
	const pageValue: SelectOption = { label: `Page ${page + 1}`, value: page.toString() };

	const previousPage = () => setPage(page - 1);
	const nextPage = () => setPage(page + 1);
	const onPageChange = (option: any) => {
		if (typeof option !== "object") return;
		const { value } = option as SelectOption;

		setPage(Number(value));
	};

	return (
		<Modal onClick={onClick} isOpen={isOpen}>
			<div className="w-[60vw] max-xl:w-[80vw]">
				<div className="flex items-center justify-between max-sm:flex-col">
					<h1 className="text-3xl">Invite Codes</h1>
					<div className="flex gap-4">
						<TransparentButton type="button" onClick={previousPage} disabled={page <= 0}>
							<i className="fa-solid fa-angle-left text-lg" />
						</TransparentButton>
						<SelectMenu type="main" placeholder="page" options={pageOptions} value={pageValue} onChange={onPageChange} />
						<TransparentButton type="button" onClick={nextPage} disabled={page >= invites.pages - 1}>
							<i className="fa-solid fa-angle-right text-lg" />
						</TransparentButton>
					</div>
				</div>
				<div className="max-h-[45vh] overflow-auto w-full">
					<Table className="w-full" colgroups={[325, 300, 100]} headPosition="left" heads={["Code", "Date", "Options"]}>
						{invites.entries.map((invite) => (
							<TableEntry key={invite.invite}>
								<td>
									<p title={invite.invite} className="max-w-[300px] overflow-hidden whitespace-nowrap text-ellipsis text-base">
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
				<div className="mt-4 flex gap-2 items-center max-sm:flex-col">
					<PrimaryButton type="button" onClick={onCreateClick}>
						Create Invite
					</PrimaryButton>
					<DangerButton type="button" onClick={onBulkDelete}>
						Delete Selected Invites
					</DangerButton>
				</div>
			</div>
		</Modal>
	);
};

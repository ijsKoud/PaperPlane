import { PrimaryButton, TransparentButton } from "@paperplane/buttons";
import { SelectMenu, SelectOption } from "@paperplane/forms";
import { Modal } from "@paperplane/modal";
import { useSwrWithUpdates } from "@paperplane/swr";
import type { BackupsGetApi } from "@paperplane/utils";
import type React from "react";
import { useEffect, useState } from "react";
import { Table, TableEntry } from "../../index";

interface Props {
	isOpen: boolean;
	onClick: () => void;

	toastSuccess: (str: string) => void;
	importBackup: (id: string) => void;
}

export const BackupsModal: React.FC<Props> = ({ isOpen, onClick, importBackup, toastSuccess }) => {
	const [page, setPage] = useState(0);
	const [backups, setBackups] = useState<BackupsGetApi>({ entries: [], pages: 0 });
	const { data: backupGetData } = useSwrWithUpdates<BackupsGetApi>(`/api/admin/backups/list?page=${page}`, { refreshInterval: isOpen ? 5e3 : 0 });

	useEffect(() => {
		if (backupGetData) setBackups(backupGetData);
	}, [backupGetData]);

	const pageOptions: SelectOption[] = Array(backups.pages)
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
					<h1 className="text-3xl">Backups</h1>
					<div className="flex gap-4">
						<TransparentButton type="button" onClick={previousPage} disabled={page <= 0}>
							<i className="fa-solid fa-angle-left text-lg" />
						</TransparentButton>
						<SelectMenu type="main" placeholder="page" options={pageOptions} value={pageValue} onChange={onPageChange} />
						<TransparentButton type="button" onClick={nextPage} disabled={page >= backups.pages - 1}>
							<i className="fa-solid fa-angle-right text-lg" />
						</TransparentButton>
					</div>
				</div>
				<div className="max-h-[45vh] overflow-auto w-full">
					<Table className="w-full" colgroups={["100%", 100]} headPosition="left" heads={["Name", "Options"]}>
						{backups.entries.map((backup) => (
							<TableEntry key={backup}>
								<td>
									<p
										title={backup.replace(".zip", "")}
										className="max-w-[300px] overflow-hidden whitespace-nowrap text-ellipsis text-base"
									>
										{backup.replace(".zip", "")}
									</p>
								</td>
								<td className="flex items-center gap-2">
									<PrimaryButton type="button" onClick={() => importBackup(backup.replace(".zip", ""))}>
										Import
									</PrimaryButton>
								</td>
							</TableEntry>
						))}
					</Table>
				</div>
			</div>
		</Modal>
	);
};

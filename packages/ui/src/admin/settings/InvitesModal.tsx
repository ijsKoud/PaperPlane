import { PrimaryButton, TransparentButton } from "@paperplane/buttons";
import { Modal } from "@paperplane/modal";
import { formatDate } from "@paperplane/utils";
import type React from "react";
import { Table, TableEntry } from "../../index";

interface Props {
	isOpen: boolean;
	onClick: () => void;
}

export const InvitesModal: React.FC<Props> = ({ isOpen, onClick }) => {
	return (
		<Modal onClick={onClick} isOpen={isOpen}>
			<div className="w-[50vw] max-xl:w-[80vw]">
				<h1 className="text-3xl">Invite Codes</h1>
				<div className="max-h-[45vh] overflow-auto w-full">
					<Table className="w-full" colgroups={[325, 300, 100]} headPosition="left" heads={["Code", "Date", "Options"]}>
						<TableEntry>
							<td>
								<p title="aa" className="max-w-[300px] overflow-hidden whitespace-nowrap text-ellipsis">
									{"a".repeat(50)}
								</p>
							</td>
							<td>{formatDate(new Date())}</td>
							<td className="flex items-center gap-2">
								<TransparentButton type="button">
									<i className="fa-solid fa-copy text-base" />
								</TransparentButton>
								<TransparentButton type="button">
									<i className="fa-solid fa-trash-can text-base" />
								</TransparentButton>
								<input type="checkbox" />
							</td>
						</TableEntry>
						<TableEntry>
							<td>aaaaa</td>
							<td>{formatDate(new Date())}</td>
							<td></td>
						</TableEntry>
						<TableEntry>
							<td>aaaaa</td>
							<td>{formatDate(new Date())}</td>
							<td></td>
						</TableEntry>
						<TableEntry>
							<td>aaaaa</td>
							<td>{formatDate(new Date())}</td>
							<td></td>
						</TableEntry>
						<TableEntry>
							<td>aaaaa</td>
							<td>{formatDate(new Date())}</td>
							<td></td>
						</TableEntry>
						<TableEntry>
							<td>aaaaa</td>
							<td>{formatDate(new Date())}</td>
							<td></td>
						</TableEntry>
						<TableEntry>
							<td>aaaaa</td>
							<td>{formatDate(new Date())}</td>
							<td></td>
						</TableEntry>
						<TableEntry>
							<td>aaaaa</td>
							<td>{formatDate(new Date())}</td>
							<td></td>
						</TableEntry>
						<TableEntry>
							<td>aaaaa</td>
							<td>{formatDate(new Date())}</td>
							<td></td>
						</TableEntry>
						<TableEntry>
							<td>aaaaa</td>
							<td>{formatDate(new Date())}</td>
							<td></td>
						</TableEntry>
						<TableEntry>
							<td>aaaaa</td>
							<td>{formatDate(new Date())}</td>
							<td></td>
						</TableEntry>
						<TableEntry>
							<td>aaaaa</td>
							<td>{formatDate(new Date())}</td>
							<td></td>
						</TableEntry>
						<TableEntry>
							<td>aaaaa</td>
							<td>{formatDate(new Date())}</td>
							<td></td>
						</TableEntry>
						<TableEntry>
							<td>aaaaa</td>
							<td>{formatDate(new Date())}</td>
							<td></td>
						</TableEntry>
						<TableEntry>
							<td>aaaaa</td>
							<td>{formatDate(new Date())}</td>
							<td></td>
						</TableEntry>
						<TableEntry>
							<td>aaaaa</td>
							<td>{formatDate(new Date())}</td>
							<td></td>
						</TableEntry>
						<TableEntry>
							<td>aaaaa</td>
							<td>{formatDate(new Date())}</td>
							<td></td>
						</TableEntry>
						<TableEntry>
							<td>aaaaa</td>
							<td>{formatDate(new Date())}</td>
							<td></td>
						</TableEntry>
						<TableEntry>
							<td>aaaaa</td>
							<td>{formatDate(new Date())}</td>
							<td></td>
						</TableEntry>
					</Table>
				</div>
				<div className="mt-4">
					<PrimaryButton type="button">Create Invite</PrimaryButton>
				</div>
			</div>
		</Modal>
	);
};

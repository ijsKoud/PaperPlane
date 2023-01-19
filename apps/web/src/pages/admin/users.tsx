import type { NextPage } from "next";
import { AdminLayout, Table, TableEntry } from "@paperplane/ui";
import { TertiaryButton, TransparentButton } from "@paperplane/buttons";

const AdminPanelUsers: NextPage = () => {
	return (
		<AdminLayout>
			<div className="w-full px-2">
				<div className="flex justify-between items-center w-full">
					<h1 className="text-3xl">Users</h1>
					<TertiaryButton type="button">Create</TertiaryButton>
				</div>
				<div className="w-full rounded-lg bg-main p-8 flex flex-col gap-2">
					<div className="w-full overflow-x-auto max-w-[calc(100vw-16px-64px-16px)]">
						<Table
							className="w-full min-w-[750px]"
							headPosition="left"
							heads={["Domain", "Date", "Locked", "Storage Limit", "Storage Usage", "Options"]}
						>
							<TableEntry>
								<td>cdn.ijskoud.dev</td>
								<td>12 Dec. 2022 4:32 PM</td>
								<td>
									<i className="fa-solid fa-xmark" />
								</td>
								<td>10.0 GB</td>
								<td>7.7 GB</td>
								<td className="flex items-center gap-2 px-2">
									<TransparentButton type="button">
										<i id="filebutton" className="fa-regular fa-trash-can" />
									</TransparentButton>
									<TransparentButton type="button">
										<i id="filebutton" className="fa-regular fa-pen-to-square" />
									</TransparentButton>
									<input type="checkbox" checked={false} />
								</td>
							</TableEntry>
							<TableEntry>
								<td>cdn.ijskoud.dev</td>
								<td>12 Dec. 2022 4:32 PM</td>
								<td>
									<i className="fa-solid fa-xmark" />
								</td>
								<td>10.0 GB</td>
								<td>7.7 GB</td>
								<td className="flex items-center gap-2 px-2">
									<TransparentButton type="button">
										<i id="filebutton" className="fa-regular fa-trash-can" />
									</TransparentButton>
									<TransparentButton type="button">
										<i id="filebutton" className="fa-regular fa-pen-to-square" />
									</TransparentButton>
									<input type="checkbox" checked={false} />
								</td>
							</TableEntry>
							<TableEntry>
								<td>cdn.ijskoud.dev</td>
								<td>12 Dec. 2022 4:32 PM</td>
								<td>
									<i className="fa-solid fa-xmark" />
								</td>
								<td>10.0 GB</td>
								<td>7.7 GB</td>
								<td className="flex items-center gap-2 px-2">
									<TransparentButton type="button">
										<i id="filebutton" className="fa-regular fa-trash-can" />
									</TransparentButton>
									<TransparentButton type="button">
										<i id="filebutton" className="fa-regular fa-pen-to-square" />
									</TransparentButton>
									<input type="checkbox" checked={false} />
								</td>
							</TableEntry>
							<TableEntry>
								<td>cdn.ijskoud.dev</td>
								<td>12 Dec. 2022 4:32 PM</td>
								<td>
									<i className="fa-solid fa-xmark" />
								</td>
								<td>10.0 GB</td>
								<td>7.7 GB</td>
								<td className="flex items-center gap-2 px-2">
									<TransparentButton type="button">
										<i id="filebutton" className="fa-regular fa-trash-can" />
									</TransparentButton>
									<TransparentButton type="button">
										<i id="filebutton" className="fa-regular fa-pen-to-square" />
									</TransparentButton>
									<input type="checkbox" checked={false} />
								</td>
							</TableEntry>
							<TableEntry>
								<td>cdn.ijskoud.dev</td>
								<td>12 Dec. 2022 4:32 PM</td>
								<td>
									<i className="fa-solid fa-xmark" />
								</td>
								<td>10.0 GB</td>
								<td>7.7 GB</td>
								<td className="flex items-center gap-2 px-2">
									<TransparentButton type="button">
										<i id="filebutton" className="fa-regular fa-trash-can" />
									</TransparentButton>
									<TransparentButton type="button">
										<i id="filebutton" className="fa-regular fa-pen-to-square" />
									</TransparentButton>
									<input type="checkbox" checked={false} />
								</td>
							</TableEntry>
							<TableEntry>
								<td>cdn.ijskoud.dev</td>
								<td>12 Dec. 2022 4:32 PM</td>
								<td>
									<i className="fa-solid fa-xmark" />
								</td>
								<td>10.0 GB</td>
								<td>7.7 GB</td>
								<td className="flex items-center gap-2 px-2">
									<TransparentButton type="button">
										<i id="filebutton" className="fa-regular fa-trash-can" />
									</TransparentButton>
									<TransparentButton type="button">
										<i id="filebutton" className="fa-regular fa-pen-to-square" />
									</TransparentButton>
									<input type="checkbox" checked={false} />
								</td>
							</TableEntry>
						</Table>
					</div>
				</div>
			</div>
		</AdminLayout>
	);
};

export default AdminPanelUsers;

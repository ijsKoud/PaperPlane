import type { GetServerSideProps, NextPage } from "next";
import { AdminLayout, AdminUserToolbar, CreateUserModal, Table, TableEntry } from "@paperplane/ui";
import { TertiaryButton, TransparentButton } from "@paperplane/buttons";
import { AdminUserSort, formatBytes, formatDate, getProtocol, UsersApi } from "@paperplane/utils";
import axios from "axios";
import { useEffect, useState } from "react";
import { useSwrWithUpdates } from "@paperplane/swr";

export const getServerSideProps: GetServerSideProps = async (context) => {
	const stateRes = await axios.get<{ admin: boolean; domain: boolean }>(`${getProtocol()}${context.req.headers.host}/api/auth/state`, {
		headers: { "X-PAPERPLANE-ADMIN-KEY": context.req.cookies["PAPERPLANE-ADMIN"] }
	});

	if (!stateRes.data.admin)
		return {
			redirect: {
				destination: "/login?user=admin",
				permanent: false
			}
		};

	return {
		props: {}
	};
};

const AdminPanelUsers: NextPage = () => {
	const [page, setPage] = useState(0);
	const [search, setSearch] = useState("");
	const [sort, setSort] = useState<AdminUserSort>(AdminUserSort.DATE_NEW_OLD);
	const [domains, setDomains] = useState<UsersApi>({ entries: [], pages: 0 });
	const { data: domainData } = useSwrWithUpdates<UsersApi>(
		`/api/admin/users?page=${page}&sort=${sort}&search=${encodeURIComponent(search)}`,
		undefined,
		(url) => axios({ url, withCredentials: true }).then((res) => res.data)
	);

	useEffect(() => {
		if (domainData) setDomains(domainData);
	}, [domainData]);

	const [createModal, setCreateModal] = useState(false);

	return (
		<AdminLayout className="max-w-[1250px]">
			<CreateUserModal isNew domains={[]} isOpen={createModal} onClick={() => setCreateModal(false)} />
			<div className="w-full px-2">
				<div className="flex justify-between items-center w-full">
					<h1 className="text-3xl">Users</h1>
					<TertiaryButton type="button" onClick={() => setCreateModal(true)}>
						Create
					</TertiaryButton>
				</div>
				<AdminUserToolbar page={domains.pages} setPage={setPage} pages={page} setSearch={setSearch} setSort={setSort} sort={sort} />
				<div className="w-full rounded-lg bg-main p-8 flex flex-col gap-2 mt-8">
					<div className="w-full overflow-x-auto max-w-[calc(100vw-16px-64px-16px)]">
						<Table
							className="w-full min-w-[960px]"
							headPosition="left"
							heads={["Domain", "Date", "Locked", "Storage Limit", "Storage Usage", "Options"]}
							colgroups={[192, 192, 96, 192, 192, 96]}
						>
							{domains.entries.map((domain, key) => (
								<TableEntry key={key}>
									<td title={domain.domain} className="overflow-hidden text-ellipsis whitespace-nowrap pr-1 max-w-[192px]">
										{domain.domain}
									</td>
									<td>{formatDate(domain.date)}</td>
									<td>{domain.disabled ? <i className="fa-solid fa-check" /> : <i className="fa-solid fa-xmark" />}</td>
									<td>{domain.maxStorage === 0 ? <i className="fa-solid fa-infinity" /> : formatBytes(domain.maxStorage)}</td>
									<td>{formatBytes(domain.storage)}</td>
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
							))}
						</Table>
					</div>
				</div>
			</div>
		</AdminLayout>
	);
};

export default AdminPanelUsers;

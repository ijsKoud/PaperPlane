import type { GetServerSideProps, NextPage } from "next";
import {
	AdminDeleteBanner,
	AdminLayout,
	AdminUserToolbar,
	ConfirmModal,
	CreateUserForm,
	CreateUserModal,
	Table,
	TableEntry,
	UpdateUserModal
} from "@paperplane/ui";
import { TertiaryButton, TransparentButton } from "@paperplane/buttons";
import { AdminUserSort, formatBytes, formatDate, getProtocol, parseToDay, UsersApi } from "@paperplane/utils";
import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { useSwrWithUpdates } from "@paperplane/swr";
import type { FormikHelpers } from "formik";
import { toast } from "react-toastify";

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

interface CreateUserFormBody {
	domain?: string;
	extension?: string;

	storage: string;
	uploadSize: string;

	extensions: string[];
	extensionsMode: "block" | "pass";

	auditlog: string;
}

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

	const _onSubmit = async (values: CreateUserForm, helpers: FormikHelpers<CreateUserForm>) => {
		try {
			await axios.post<any, any, CreateUserFormBody>("/api/admin/create", {
				domain: values.domain,
				extension: values.extension,
				extensions: values.extensions,
				extensionsMode: values.extensionsMode,
				auditlog: parseToDay(values.auditlog, values.auditlogUnit),
				storage: `${values.storage} ${values.storageUnit}`,
				uploadSize: `${values.uploadSize} ${values.uploadSizeUnit}`
			});
		} catch (err) {
			const _error = "isAxiosError" in err ? (err as AxiosError<{ message: string }>).response?.data.message : "";
			const error = _error || "Unknown error, please try again later.";
			helpers.resetForm({
				values,
				errors: Object.keys(values)
					.map((key) => ({ [key]: error }))
					.reduce((a, b) => ({ ...a, ...b }), {})
			});

			throw new Error();
		}
	};

	const onSubmit = async (values: CreateUserForm, helpers: FormikHelpers<CreateUserForm>) => {
		try {
			await toast.promise(_onSubmit(values, helpers), {
				pending: "Upgrading the PaperPlanes...",
				error: "A PaperPlane crashed while testing :(",
				success: "The new PaperPlanes are ready to use."
			});

			setCreateModal(false);
		} catch (error) {}
	};

	const [selected, setSelected] = useState<string[]>([]);
	const toggleSelected = (domain: string) => {
		if (selected.includes(domain)) {
			setSelected(selected.filter((dm) => dm !== domain));
			return;
		}

		setSelected([...selected, domain]);
	};

	const [editBulk, setEditBulk] = useState(false);
	const enableEditBulk = () => setEditBulk(true);

	const [deleteBulk, setDeleteBulk] = useState(false);
	const enableDeleteBulk = () => setDeleteBulk(true);

	const _onSubmitBulk = async (values: CreateUserForm & { disabled: boolean }, helpers: FormikHelpers<CreateUserForm>) => {
		try {
			await axios.put<any, any, CreateUserFormBody & { domains: string[]; disabled: boolean }>("/api/admin/create", {
				domains: selected,
				disabled: values.disabled,
				extensions: values.extensions,
				extensionsMode: values.extensionsMode,
				auditlog: parseToDay(values.auditlog, values.auditlogUnit),
				storage: `${values.storage} ${values.storageUnit}`,
				uploadSize: `${values.uploadSize} ${values.uploadSizeUnit}`
			});
		} catch (err) {
			const _error = "isAxiosError" in err ? (err as AxiosError<{ message: string }>).response?.data.message : "";
			const error = _error || "Unknown error, please try again later.";
			helpers.resetForm({
				values,
				errors: Object.keys(values)
					.map((key) => ({ [key]: error }))
					.reduce((a, b) => ({ ...a, ...b }), {})
			});

			throw new Error();
		}
	};

	const onSubmitBulk = async (values: CreateUserForm & { disabled: boolean }, helpers: FormikHelpers<CreateUserForm>) => {
		try {
			await toast.promise(_onSubmitBulk(values, helpers), {
				pending: "Upgrading the PaperPlanes...",
				error: "A PaperPlane crashed while testing :(",
				success: "The new PaperPlanes are ready to use."
			});

			setSelected([]);
			setEditBulk(false);
		} catch (error) {}
	};

	const _onSubmitDelete = async () => {
		try {
			await axios.delete("/api/admin/create", {
				data: { domains: selected }
			});
		} catch (err) {
			const _error = "isAxiosError" in err ? (err as AxiosError<{ message: string }>).response?.data.message : "";
			const error = _error || "Unknown error, please try again later.";
			console.log(error);

			throw new Error();
		}
	};

	const onSubmitDelete = async () => {
		try {
			await toast.promise(_onSubmitDelete(), {
				pending: "Destroying the PaperPlanes...",
				error: "A PaperPlane fled while dismantling :(",
				success: "The PaperPlanes are destroyed."
			});

			setSelected([]);
			setDeleteBulk(false);
		} catch (error) {}
	};

	const editSingle = (domain: string) => {
		setSelected([domain]);
		setEditBulk(true);
	};

	const deleteSingle = (domain: string) => {
		setSelected([domain]);
		setDeleteBulk(true);
	};

	return (
		<AdminLayout className="max-w-[1250px]">
			<ConfirmModal isOpen={deleteBulk} cancel={() => setDeleteBulk(false)} confirm={onSubmitDelete} />
			<CreateUserModal onSubmit={onSubmit} isOpen={createModal} onClick={() => setCreateModal(false)} />
			<UpdateUserModal domains={selected} onSubmit={onSubmitBulk} isOpen={editBulk} onClick={() => setEditBulk(false)} />
			<AdminDeleteBanner items={selected} settings={enableEditBulk} cancel={() => setSelected([])} deleteFn={enableDeleteBulk} />
			<div className="w-full px-2">
				<div className="flex justify-between items-center w-full">
					<h1 className="text-3xl">Users</h1>
					<TertiaryButton type="button" onClick={() => setCreateModal(true)}>
						Create
					</TertiaryButton>
				</div>
				<AdminUserToolbar page={page} setPage={setPage} pages={domains.pages} setSearch={setSearch} setSort={setSort} sort={sort} />
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
											<i id="filebutton" className="fa-regular fa-trash-can" onClick={() => deleteSingle(domain.domain)} />
										</TransparentButton>
										<TransparentButton type="button" onClick={() => editSingle(domain.domain)}>
											<i id="filebutton" className="fa-regular fa-pen-to-square" />
										</TransparentButton>
										<input
											type="checkbox"
											checked={selected.includes(domain.domain)}
											onChange={() => toggleSelected(domain.domain)}
										/>
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

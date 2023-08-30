import type { GetServerSideProps, NextPage } from "next";
import {
	AdminBackups,
	AdminDomains,
	AdminLayout,
	AdminResetButtons,
	AdminSettingsForm,
	BackupsModal,
	InvitesModal,
	type SettingsForm
} from "@paperplane/components";
import axios, { AxiosError } from "axios";
import { getProtocol, type Invite, parseToDay } from "@paperplane/utils";
import type { FormikHelpers } from "formik";
import { toast } from "react-toastify";
import { useState } from "react";
import { NextSeo } from "next-seo";

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

const AdminSettingsPanel: NextPage = () => {
	const _onSubmitBulk = async (values: SettingsForm, helpers: FormikHelpers<SettingsForm>) => {
		try {
			await axios.post("/api/admin/settings", {
				...values,
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

	const onSubmit = async (values: SettingsForm, helpers: FormikHelpers<SettingsForm>) => {
		try {
			await toast.promise(_onSubmitBulk(values, helpers), {
				pending: "Upgrading the PaperPlanes...",
				error: "A PaperPlane crashed while testing :(",
				success: "The new PaperPlanes are ready to use."
			});
		} catch (error) {}
	};

	const createInviteCode = async () => {
		const promise = async () => {
			try {
				const res = await axios.post<Invite>("/api/invites/create");
				return res.data;
			} catch (err) {
				const _error = "isAxiosError" in err ? (err as AxiosError<{ message: string }>).response?.data.message : "";
				const error = _error || "Unknown error, please try again later.";
				console.log(error);

				throw new Error();
			}
		};

		try {
			const res = await toast.promise(promise(), {
				pending: "Inviting all PaperPlanes...",
				error: "The carrier pigeons failed to deliver the invites :(",
				success: "All PaperPlanes invited!"
			});

			return res;
		} catch (error) {}

		return undefined;
	};

	const deleteInviteCode = async (invites: string[]) => {
		const promise = async () => {
			try {
				await axios.delete<Invite>("/api/invites/create", { data: { invites } });
			} catch (err) {
				const _error = "isAxiosError" in err ? (err as AxiosError<{ message: string }>).response?.data.message : "";
				const error = _error || "Unknown error, please try again later.";
				console.log(error);

				throw new Error();
			}
		};

		try {
			await toast.promise(promise(), {
				pending: "Removing someone from the party...",
				error: "Everyone left the party instead :(",
				success: "Someone left the party."
			});
		} catch (error) {}
	};

	const deleteDomain = async (domains: string[]) => {
		const promise = async () => {
			try {
				await axios.delete("/api/admin/domains", { data: { domains } });
			} catch (err) {
				const _error = "isAxiosError" in err ? (err as AxiosError<{ message: string }>).response?.data.message : "";
				const error = _error || "Unknown error, please try again later.";
				console.log(error);

				throw new Error();
			}
		};

		try {
			await toast.promise(promise(), {
				pending: "Destroying hangers...",
				error: "One of the hangers was to strong :(",
				success: "Hangers destroyed! Mission Successful."
			});
		} catch (error) {}
	};

	const createDomain = async (data: { domain: string }, helpers: FormikHelpers<{ domain: string }>) => {
		const promise = async () => {
			try {
				await axios.post("/api/admin/domains", data);
			} catch (err) {
				const _error = "isAxiosError" in err ? (err as AxiosError<{ message: string }>).response?.data.message : "";
				const error = _error || "Unknown error, please try again later.";
				helpers.resetForm({
					values: data,
					errors: Object.keys(data)
						.map((key) => ({ [key]: error }))
						.reduce((a, b) => ({ ...a, ...b }), {})
				});

				throw new Error();
			}
		};

		try {
			await toast.promise(promise(), {
				pending: "Building new hanger...",
				error: "Hanger collapsed during the construction :(",
				success: "New hanger is completed and ready to use!."
			});
		} catch (error) {}
	};

	const resetEncryptionKey = async (): Promise<boolean> => {
		const promise = async () => {
			try {
				await axios.post("/api/admin/reset");
			} catch (err) {
				const _error = "isAxiosError" in err ? (err as AxiosError<{ message: string }>).response?.data.message : "";
				const error = _error || "Unknown error, please try again later.";
				console.log(error);

				throw new Error();
			}
		};

		try {
			await toast.promise(promise(), {
				pending: "Building new hanger...",
				error: "Hanger collapsed during the construction :(",
				success: "New hanger is completed and ready to use!."
			});

			return true;
		} catch (error) {}

		return false;
	};

	const createBackup = async () => {
		const promise = async () => {
			try {
				const res = await axios.post<{ name: string }>("/api/admin/backups/create", undefined, { withCredentials: true, timeout: 9e5 });
				return res.data;
			} catch (err) {
				const _error = "isAxiosError" in err ? (err as AxiosError<{ message: string }>).response?.data.message : "";
				const error = _error || "Unknown error, please try again later.";
				console.log(error);

				throw new Error();
			}
		};

		try {
			const res = await toast.promise(promise(), {
				pending: "Building backup airport...",
				error: "Not enough money to build it :(",
				success: "New airport created."
			});

			toast.success(`New backup created with id: ${res.name}`);
		} catch (error) {}
	};

	const importBackup = async (id: string) => {
		const promise = async () => {
			try {
				await axios.post("/api/admin/backups/import", { id }, { withCredentials: true, timeout: 9e5 });
			} catch (err) {
				const _error = "isAxiosError" in err ? (err as AxiosError<{ message: string }>).response?.data.message : "";
				const error = _error || "Unknown error, please try again later.";
				console.log(error);

				throw new Error();
			}
		};

		try {
			await toast.promise(promise(), {
				pending: "Moving to different airport...",
				error: "Not enough money to move :(",
				success: "Moved to new aiport, please restart the server as soon as possible!"
			});
		} catch (error) {}
	};

	const [inviteModal, setInviteModal] = useState(false);
	const enableInviteModal = () => setInviteModal(true);
	const disableInviteModal = () => setInviteModal(false);

	const [backupModal, setBackupModal] = useState(false);
	const enableBackupModal = () => setBackupModal(true);
	const disableBackupModal = () => setBackupModal(false);

	return (
		<AdminLayout toastInfo={(str) => toast.info(str)}>
			<NextSeo title="Admin Settings Panel" />
			<InvitesModal
				isOpen={inviteModal}
				onClick={disableInviteModal}
				createInvite={createInviteCode}
				deleteInvite={deleteInviteCode}
				toastSuccess={(str) => toast.success(str)}
			/>
			<BackupsModal isOpen={backupModal} onClick={disableBackupModal} toastSuccess={toast.success} importBackup={importBackup} />
			<AdminSettingsForm onSubmit={onSubmit} enableInviteModal={enableInviteModal} />
			<AdminDomains createDomain={createDomain} deleteDomain={deleteDomain} toastSuccess={(str) => toast.success(str)} />
			<AdminBackups createBackup={createBackup} backupModal={enableBackupModal} />
			<AdminResetButtons resetEncryptionKey={resetEncryptionKey} />
		</AdminLayout>
	);
};

export default AdminSettingsPanel;

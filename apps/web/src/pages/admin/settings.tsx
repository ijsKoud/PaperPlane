import type { GetServerSideProps, NextPage } from "next";
import { AdminLayout, AdminSettingsForm, InvitesModal, SettingsForm } from "@paperplane/ui";
import axios, { AxiosError } from "axios";
import { getProtocol, Invite, parseToDay } from "@paperplane/utils";
import type { FormikHelpers } from "formik";
import { toast } from "react-toastify";
import { useState } from "react";

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

	const [inviteModal, setInviteModal] = useState(false);
	const enableInviteModal = () => setInviteModal(true);
	const disableInviteModal = () => setInviteModal(false);

	return (
		<AdminLayout>
			<InvitesModal
				isOpen={inviteModal}
				onClick={disableInviteModal}
				createInvite={createInviteCode}
				toastSuccess={(str) => toast.success(str)}
			/>
			<AdminSettingsForm onSubmit={onSubmit} enableInviteModal={enableInviteModal} />
		</AdminLayout>
	);
};

export default AdminSettingsPanel;

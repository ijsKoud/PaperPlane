import type { GetServerSideProps, NextPage } from "next";
import { AdminLayout, AdminSettingsForm, SettingsForm } from "@paperplane/ui";
import axios, { AxiosError } from "axios";
import { getProtocol, parseToDay } from "@paperplane/utils";
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

	return (
		<AdminLayout>
			<AdminSettingsForm onSubmit={onSubmit} />
		</AdminLayout>
	);
};

export default AdminSettingsPanel;

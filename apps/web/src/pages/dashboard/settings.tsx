import type { GetServerSideProps, NextPage } from "next";
import { DashboardLayout, DashboardSettingsForm, TokenModal } from "@paperplane/ui";
import { toast } from "react-toastify";
import { getProtocol } from "@paperplane/utils";
import axios, { AxiosError } from "axios";
import { NextSeo } from "next-seo";
import type { FormikHelpers } from "formik";
import { useState } from "react";

export const getServerSideProps: GetServerSideProps = async (context) => {
	const stateRes = await axios.get<{ admin: boolean; domain: boolean }>(`${getProtocol()}${context.req.headers.host}/api/auth/state`, {
		headers: { "X-PAPERPLANE-AUTH-KEY": context.req.cookies["PAPERPLANE-AUTH"] }
	});

	if (!stateRes.data.domain)
		return {
			redirect: {
				destination: "/login",
				permanent: false
			}
		};

	return {
		props: {}
	};
};

const DashboardSettings: NextPage = () => {
	const [tokenModal, setTokenModal] = useState(false);
	const openTokenModal = () => setTokenModal(true);
	const closeTokenModal = () => setTokenModal(false);

	const onSubmit = async (values: DashboardSettingsForm & { tokens: string[] }, helpers: FormikHelpers<DashboardSettingsForm>) => {
		const promise = async () => {
			try {
				const { tokens, ...rest } = values;
				await axios.post("/api/dashboard/settings", rest);
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

		try {
			await toast.promise(promise(), {
				pending: "Upgrading the PaperPlane...",
				error: "The PaperPlane crashed while testing :(",
				success: "The new PaperPlane is ready to use."
			});
		} catch (error) {}
	};

	const deleteTokens = async (tokens: string[]) => {
		const promise = async () => {
			try {
				await axios.delete("/api/dashboard/tokens", { data: { tokens } });
			} catch (err) {
				const _error = "isAxiosError" in err ? (err as AxiosError<{ message: string }>).response?.data.message : "";
				const error = _error || "Unknown error, please try again later.";
				console.log(error);

				throw new Error();
			}
		};

		try {
			await toast.promise(promise(), {
				pending: "Removing keys from the system...",
				error: "Unable to delete the keys :(",
				success: "Keys removed from the system!"
			});
		} catch (error) {}
	};

	const createToken = async (values: { name: string }, helpers: FormikHelpers<{ name: string }>) => {
		const promise = async () => {
			try {
				const res = await axios.post<string>("/api/dashboard/tokens", values);
				return res.data;
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

		try {
			const res = await toast.promise(promise(), {
				pending: "Upgrading the PaperPlane...",
				error: "The PaperPlane crashed while testing :(",
				success: "The new PaperPlane is ready to use."
			});
			return res;
		} catch (error) {}

		return undefined;
	};

	return (
		<DashboardLayout toastInfo={(str) => toast.info(str)}>
			<NextSeo title="Settings" />
			<TokenModal isOpen={tokenModal} onClick={closeTokenModal} generateToken={createToken} />
			<DashboardSettingsForm onSubmit={onSubmit} deleteTokens={deleteTokens} openTokenModal={openTokenModal} />
		</DashboardLayout>
	);
};

export default DashboardSettings;

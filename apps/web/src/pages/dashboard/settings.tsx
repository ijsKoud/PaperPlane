import type { GetServerSideProps, NextPage } from "next";
import { ConfirmModal, DashboardLayout, DashboardSettingsForm, EmbedModal, ResetAuthForm, ResetAuthModal, TokenModal } from "@paperplane/ui";
import { toast } from "react-toastify";
import { DashboardEmbedGetApi, generateToken, getProtocol } from "@paperplane/utils";
import axios, { AxiosError } from "axios";
import { NextSeo } from "next-seo";
import type { FormikHelpers } from "formik";
import { useState } from "react";
import { saveAs } from "file-saver";
import { useRouter } from "next/router";

export const getServerSideProps: GetServerSideProps = async (context) => {
	const stateRes = await axios.get<{ admin: boolean; domain: boolean; mode: "2fa" | "password" }>(
		`${getProtocol()}${context.req.headers.host}/api/auth/state`,
		{
			headers: { "X-PAPERPLANE-AUTH-KEY": context.req.cookies["PAPERPLANE-AUTH"] }
		}
	);

	if (!stateRes.data.domain)
		return {
			redirect: {
				destination: "/login",
				permanent: false
			}
		};

	return {
		props: {
			authMode: stateRes.data.mode
		}
	};
};

const DashboardSettings: NextPage<{ authMode: "2fa" | "password" }> = ({ authMode }) => {
	const router = useRouter();

	const [tokenModal, setTokenModal] = useState(false);
	const openTokenModal = () => setTokenModal(true);
	const closeTokenModal = () => setTokenModal(false);

	const [embedModal, setEmbedModal] = useState(false);
	const openEmbedModal = () => setEmbedModal(true);
	const closeEmbedModal = () => setEmbedModal(false);

	const [ResetAccount, setResetAccount] = useState(false);
	const openResetAccount = () => setResetAccount(true);
	const closeResetAccount = () => setResetAccount(false);

	const [resetAuth, setResetAuth] = useState(false);
	const openResetAuth = () => setResetAuth(true);
	const closeResetAuth = () => setResetAuth(false);

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

	const downloadShareX = async () => {
		const promise = async () => {
			try {
				const res = await axios.post<string>("/api/dashboard/tokens", { name: `ShareX-token-${generateToken(12)}` });
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
				pending: "Downloading ShareX configuration...",
				error: "Unable to download the configuration :(",
				success: "ShareX configuration downloaded and ready to use!"
			});

			const config = {
				Name: "PaperPlane",
				DestinationType: "ImageUploader, TextUploader, FileUploader, URLShortener",
				RequestMethod: "POST",
				RequestURL: `${location.protocol}//${location.host}/api/upload`,
				Headers: {
					Authorization: res
				},
				URL: "$json:url$",
				Body: "MultipartFormData",
				FileFormName: "upload",
				Arguments: {
					name: "$filename$",
					short: "$input$"
				}
			};

			const blob = new Blob([JSON.stringify(config)], {
				type: "data:application/json;charset=utf-8"
			});
			saveAs(blob, "PaperPlane-config.sxcu");
		} catch (error) {}
	};

	const updateEmbed = async (values: DashboardEmbedGetApi, helpers: FormikHelpers<DashboardEmbedGetApi>) => {
		const promise = async () => {
			try {
				await axios.post<string>("/api/dashboard/embed", values);
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
				pending: "Repainting the PaperPlane decals...",
				error: "The paint wasn't dry before the expected end date :(",
				success: "The repainted PaperPlane is ready to use!"
			});
		} catch (error) {}

		return undefined;
	};

	const resetAccount = async () => {
		const promise = async () => {
			try {
				await axios.delete<string>("/api/dashboard/reset");
			} catch (err) {
				const _error = "isAxiosError" in err ? (err as AxiosError<{ message: string }>).response?.data.message : "";
				const error = _error || "Unknown error, please try again later.";
				console.log(error);

				throw new Error();
			}
		};

		try {
			await toast.promise(promise(), {
				pending: "Rebuilding the PaperPlane...",
				error: "Could not rebuild the PaperPlane due to missing pieces",
				success: "PaperPlane rebuilt successfully. Use the code 'paperplane-cdn' to reset your password/2fa key."
			});
			void router.push("/reset");
		} catch (error) {}
	};

	const resetAuthFn = async (values: ResetAuthForm, helpers: FormikHelpers<ResetAuthForm>) => {
		const promise = async () => {
			try {
				const codes = await axios.post<string[]>("/api/dashboard/reset", values);
				return codes.data;
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
				pending: "Repainting the PaperPlane decals...",
				error: "The paint wasn't dry before the expected end date :(",
				success: "The repainted PaperPlane is ready to use!"
			});
			return res;
		} catch (error) {}

		return undefined;
	};

	const downloadCodes = (codes: string[]) => {
		const blob = new Blob([codes.join("\n")], {
			type: "data:application/json;charset=utf-8"
		});
		saveAs(blob, "paperplane-backup-codes.txt");
	};

	return (
		<DashboardLayout toastInfo={(str) => toast.info(str)}>
			<NextSeo title="Settings" />
			<TokenModal isOpen={tokenModal} onClick={closeTokenModal} generateToken={createToken} />
			<EmbedModal isOpen={embedModal} onClick={closeEmbedModal} updateEmbed={updateEmbed} />
			<ConfirmModal isOpen={ResetAccount} cancel={closeResetAccount} confirm={resetAccount} />
			<ResetAuthModal isOpen={resetAuth} onClick={closeResetAuth} authMode={authMode} resetAuth={resetAuthFn} downloadCodes={downloadCodes} />
			<DashboardSettingsForm
				onSubmit={onSubmit}
				deleteTokens={deleteTokens}
				openEmbedModal={openEmbedModal}
				openTokenModal={openTokenModal}
				openResetAccount={openResetAccount}
				openResetAuth={openResetAuth}
				downloadShareX={downloadShareX}
			/>
		</DashboardLayout>
	);
};

export default DashboardSettings;

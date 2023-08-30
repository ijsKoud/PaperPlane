import { PrimaryButton, TransparentButton } from "@paperplane/buttons";
import { Input } from "@paperplane/forms";
import { Modal } from "@paperplane/modal";
import axios from "axios";
import { Form, Formik, type FormikHelpers } from "formik";
import type React from "react";
import { useEffect, useState } from "react";
import { PulseLoader } from "react-spinners";
import { object, string } from "yup";

interface Props {
	isOpen: boolean;
	authMode: "2fa" | "password";

	onClick: () => void;
	downloadCodes: (codes: string[]) => void;
	resetAuth: (...props: any) => Promise<string[] | undefined>;
}

export interface ResetAuthProps {
	authMode: "2fa" | "password";
}

export interface TwoFAGetApi {
	key: string;
	uri: string;
	secret: string;
}

export interface ResetAuthForm {
	auth: string;
	key?: string;
}

export const ResetAuthModal: React.FC<Props> = ({ isOpen, authMode, onClick, resetAuth, downloadCodes }) => {
	const [password, setPassword] = useState(false);
	const [backupCodes, setBackupCodes] = useState<string[]>([]);
	const togglePassword = () => setPassword(!password);

	const [data, setData] = useState<TwoFAGetApi>();
	useEffect(() => {
		if (isOpen && !data) {
			void axios.post("/api/auth/reset", undefined, { withCredentials: true }).then((res) => setData(res.data));

			const timeout = setTimeout(
				() => isOpen && axios.post("/api/auth/reset", undefined, { withCredentials: true }).then((res) => setData(res.data)),
				9e5
			);
			return () => clearTimeout(timeout);
		}

		return () => void 0;
	}, [isOpen, data]);

	const schema =
		authMode === "2fa"
			? object({
					auth: string().required().length(6, "Code must be 6 characters long")
			  })
			: object({
					auth: string().required()
			  });

	const submitForm = async (values: ResetAuthForm, helpers: FormikHelpers<ResetAuthForm>) => {
		const codes = await resetAuth({ ...values, key: data?.key }, helpers);
		if (codes) setBackupCodes(codes);
	};

	return (
		<Modal isOpen={isOpen} onClick={onClick}>
			<div className="w-[60vw] max-xl:w-[80vw]">
				<h1 className="text-3xl">{authMode === "2fa" ? "Reset 2FA Key" : "Reset Password"}</h1>
				{backupCodes.length ? (
					<>
						<p className="text-base">
							Here are your backup codes, store them somewhere save because you this is the only time you will see them.
						</p>
						<div className="grid grid-cols-3">
							{backupCodes.map((code, key) => (
								<p key={key} className="text-base font-semibold bg-main m-1 p-2 rounded-xl">
									{code}
								</p>
							))}
						</div>
						<PrimaryButton type="button" className="mt-2" onClick={() => downloadCodes(backupCodes)}>
							Download Codes
						</PrimaryButton>
					</>
				) : (
					<>
						<p className="text-base">
							You are about to reset your autherization credentials, doing so will also reset your backup codes.
						</p>
						<div className="mt-4 flex gap-2 justify-center flex-col">
							{authMode === "2fa" &&
								(data ? (
									<div>
										<img
											alt="2FA QR Code"
											src={`https://chart.googleapis.com/chart?chs=166x166&chld=L|0&cht=qr&chl=${encodeURIComponent(data.uri)}`}
										/>
										<p className="text-base">
											Scan the QR-Code above or use the following Code: <strong>{data.secret}</strong>. Note: this resets every{" "}
											<strong>15 minutes</strong>!
										</p>
									</div>
								) : (
									<div>
										<PulseLoader color="#fff" size={20} />
									</div>
								))}
							<Formik initialValues={{ auth: "" }} validationSchema={schema} onSubmit={submitForm} validateOnMount>
								{(formik) => (
									<Form className="flex flex-col gap-4">
										<ul className="w-full mt-4 max-h-[45vh] pr-2 overflow-y-auto max-sm:max-h-[35vh]">
											<li className="w-full mt-4">
												<div className="mb-2">
													<h2 className="text-lg">{authMode === "2fa" ? "2FA Code" : "Password"}</h2>
												</div>
												<div className="flex items-center gap-2 w-full">
													<div className="w-full">
														{authMode === "2fa" ? (
															<Input
																className="h-[45px] w-full"
																type="primary"
																formType="number"
																placeholder="2FA code here"
																value={formik.values.auth}
																onChange={(ctx) => formik.setFieldValue("auth", ctx.currentTarget.value)}
															/>
														) : (
															<div className="w-full flex items-center gap-4 justify-center">
																<Input
																	className="h-[45px] w-full"
																	type="primary"
																	formType={password ? "text" : "password"}
																	placeholder="New password here"
																	value={formik.values.auth}
																	onChange={(ctx) => formik.setFieldValue("auth", ctx.currentTarget.value)}
																/>
																<TransparentButton type="button" onClick={togglePassword}>
																	{password ? (
																		<i className="fa-solid fa-eye-slash text-base" />
																	) : (
																		<i className="fa-solid fa-eye text-base" />
																	)}
																</TransparentButton>
															</div>
														)}
														<p className="text-red text-left text-small font-normal">
															{formik.errors.auth && `* ${formik.errors.auth}`}&#8203;
														</p>
													</div>
												</div>
											</li>
										</ul>
										<div className="w-fit max-lg:w-full">
											<PrimaryButton
												type="button"
												className="max-lg:w-full"
												disabled={formik.isSubmitting || !formik.isValid}
												onClick={formik.submitForm}
											>
												{formik.isSubmitting ? <PulseLoader color="#fff" /> : <>Reset credentials</>}
											</PrimaryButton>
											<p className="text-red text-left text-small font-normal">&#8203;</p>
										</div>
									</Form>
								)}
							</Formik>
						</div>
					</>
				)}
			</div>
		</Modal>
	);
};

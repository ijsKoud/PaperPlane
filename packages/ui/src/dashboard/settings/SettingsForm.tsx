import { DangerButton, PrimaryButton, TertiaryButton, TransparentButton } from "@paperplane/buttons";
import { Input, SelectMenu, SelectOption } from "@paperplane/forms";
import { useSwrWithUpdates } from "@paperplane/swr";
import { DashboardSettingsGetApi, formatDate } from "@paperplane/utils";
import { Form, Formik } from "formik";
import type React from "react";
import { useEffect, useState } from "react";
import { PulseLoader } from "react-spinners";
import { boolean, number, object, string } from "yup";
import { Table, TableEntry } from "../../index";

interface Props {
	onSubmit: (...props: any) => void | Promise<void>;
	deleteTokens: (tokens: string[]) => Promise<void>;

	openEmbedModal: () => void;
	openTokenModal: () => void;
	openResetAccount: () => void;
	openResetAuth: () => void;
	downloadShareX: () => void;
}

export interface DashboardSettingsForm {
	nameStrategy: "id" | "zerowidth" | "name";
	nameLength: number;
	embedEnabled: boolean;
}

export const DashboardSettingsForm: React.FC<Props> = ({
	onSubmit,
	deleteTokens: _deleteTokens,
	openEmbedModal,
	openTokenModal,
	openResetAccount,
	openResetAuth,
	downloadShareX
}) => {
	const [selected, setSelected] = useState<string[]>([]);
	const [initValues, setInitValues] = useState<DashboardSettingsForm & { tokens: DashboardSettingsGetApi["tokens"] }>({
		embedEnabled: false,
		nameLength: 10,
		nameStrategy: "id",
		tokens: []
	});
	const { data: settingsGetData, mutate } = useSwrWithUpdates<DashboardSettingsGetApi>("/api/dashboard/settings");

	useEffect(() => {
		if (settingsGetData) setInitValues(settingsGetData);
	}, [settingsGetData]);

	const schema = object({
		nameStrategy: string().required("A naming strategy is required").oneOf(["id", "zerowidth", "name"]),
		nameLength: number().required("A name length is required").min(4, "Name length cannot be smaller than 4 characters"),
		embedEnabled: boolean().required()
	});

	const onSelectClick = (token: string) => {
		if (selected.includes(token)) setSelected(selected.filter((x) => x !== token));
		else setSelected([token, ...selected]);
	};

	const deleteTokens = async () => {
		if (!selected.length) return;

		await _deleteTokens(selected);
		await mutate();

		setSelected([]);
	};

	const deleteToken = async (token: string) => {
		await _deleteTokens([token]);
		await mutate();
	};

	return (
		<div className="max-w-[60vw] max-xl:max-w-[75vw] max-md:max-w-[100vw]">
			<div>
				<h1 className="text-3xl">Settings</h1>
			</div>
			<Formik validationSchema={schema} initialValues={initValues} onSubmit={onSubmit} validateOnMount enableReinitialize>
				{(formik) => (
					<Form>
						<ul className="w-full mt-4 pr-2">
							<li className="w-full mt-4">
								<div className="mb-2">
									<h2 className="text-lg">API Access</h2>
									<p className="text-base">
										This allows you to create <strong>API Tokens</strong> and a <strong>Generate ShareX configuration</strong>{" "}
										which can be used to interact with the upload API. For more information of the Upload API, read the
										<strong>documentation</strong>.
									</p>
								</div>
								<div className="bg-red p-2 rounded-xl my-4">
									⚠️ <strong>Warning</strong>: Never share API Tokens with anyone except yourself. People could do dangerous things
									without your knowledge.
								</div>
								<div className="flex items-center gap-2 w-full bg-main p-8 rounded-xl overflow-auto">
									<Table className="w-full" headPosition="left" heads={["Name", "Date", "Options"]} colgroups={[350, 200, 100]}>
										{initValues.tokens.map((token, key) => (
											<TableEntry key={key}>
												<td>
													<p
														title={token.name}
														className="max-w-[350px] overflow-hidden whitespace-nowrap text-ellipsis text-base"
													>
														{token.name}
													</p>
												</td>
												<td>{formatDate(token.date)}</td>
												<td className="flex items-center gap-2">
													<TransparentButton type="button" onClick={() => void deleteToken(token.name)}>
														<i className="fa-solid fa-trash-can text-base" />
													</TransparentButton>
													<input
														type="checkbox"
														checked={selected.includes(token.name)}
														onChange={() => onSelectClick(token.name)}
													/>
												</td>
											</TableEntry>
										))}
									</Table>
								</div>
								<div className="flex items-center gap-2 mt-4">
									<TertiaryButton type="button" onClick={openTokenModal}>
										Generate Token
									</TertiaryButton>
									<TertiaryButton type="button" onClick={downloadShareX}>
										Download ShareX Config
									</TertiaryButton>
									<DangerButton type="button" onClick={deleteTokens}>
										Delete Selected
									</DangerButton>
								</div>
							</li>
							<li className="w-full mt-4">
								<div className="mb-2">
									<h2 className="text-lg">Embed Settings</h2>
									<p className="text-base">
										Certain applications like Discord allow you to set custom embeds (OG Metadata) for your files, you can fully
										customise it below or disable the feature all together.
									</p>
								</div>
								<div className="flex items-center gap-4 w-full">
									<div className="w-fit">
										<TertiaryButton type="button" onClick={openEmbedModal}>
											Open Editor
										</TertiaryButton>
									</div>
									<div className="w-fit flex items-center gap-2">
										<input
											type="checkbox"
											checked={formik.values.embedEnabled}
											onChange={(ctx) => formik.setFieldValue("embedEnabled", ctx.currentTarget.checked)}
										/>
										<p className="text-left text-base">Show Embeds</p>
									</div>
								</div>
							</li>
							<li className="w-full mt-4">
								<div className="mb-2">
									<h2 className="text-lg">Naming Strategy</h2>
									<p className="text-base">
										PaperPlane gives every uploaded file or created shorturl a name, you can define how it is created below.{" "}
										<strong>ID</strong> is a unique generated id, <strong>name</strong> will be the name of the original file.{" "}
										<strong>Zerowidth</strong> is an id using zerowidth characters. You can also define the length below. We
										recommend a length between 8 and 12 characters.
									</p>
								</div>
								<div className="flex items-center gap-2 w-full">
									<div className="w-3/4 max-sm:w-1/2">
										<Input
											type="tertiary"
											formType="number"
											inputMode="numeric"
											placeholder="character amount, 10=default, 8-12=recommended"
											className="w-full"
											value={formik.values.nameLength}
											onChange={(ctx) => formik.setFieldValue("nameLength", Number(ctx.currentTarget.value))}
										/>
										<p className="text-red text-left text-small font-normal">
											{formik.errors.nameLength && `* ${formik.errors.nameLength}`}&#8203;
										</p>
									</div>
									<div className="w-1/4 max-sm:w-1/2">
										<SelectMenu
											type="tertiary"
											placeholder="Select a unit"
											className="w-full"
											options={[
												{ label: "Strategy: id", value: "id" },
												{ label: "Strategy: name", value: "name" },
												{ label: "Strategy: zerowidth", value: "zerowidth" }
											]}
											onChange={(value) => formik.setFieldValue("nameStrategy", (value as SelectOption).value)}
											value={{
												label: `Strategy: ${formik.values.nameStrategy}`,
												value: formik.values.nameStrategy
											}}
										/>
										<p className="text-red text-left text-small font-normal">
											{formik.errors.nameStrategy && `* ${formik.errors.nameStrategy}`}&#8203;
										</p>
									</div>
								</div>
							</li>
							<li className="w-full mt-4">
								<div className="mb-2">
									<h2 className="text-lg">BIG RED BUTTONS!!</h2>
									<p className="text-base">
										Here you can reset your password/2FA or your account. Note: once a reset is progress you cannot go back so use
										it wisely!
									</p>
								</div>
								<div className="flex items-center gap-2 w-full">
									<DangerButton type="button" onClick={openResetAccount}>
										Reset Account
									</DangerButton>
									<DangerButton type="button" onClick={openResetAuth}>
										Reset 2FA/Password
									</DangerButton>
								</div>
							</li>
						</ul>
						<PrimaryButton type="button" className="my-8" disabled={formik.isSubmitting || !formik.isValid} onClick={formik.submitForm}>
							{formik.isSubmitting ? <PulseLoader color="#fff" /> : <>Update Settings</>}
						</PrimaryButton>
					</Form>
				)}
			</Formik>
		</div>
	);
};

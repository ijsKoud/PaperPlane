import { PrimaryButton } from "@paperplane/buttons";
import { Input, SelectMenu, SelectOption } from "@paperplane/forms";
import { Modal } from "@paperplane/modal";
import { useSwr } from "@paperplane/swr";
import { CreateGetApi, formatBytes, STORAGE_UNITS, TIME_UNITS, TIME_UNITS_ARRAY } from "@paperplane/utils";
import axios from "axios";
import { Form, Formik } from "formik";
import ms from "ms";
import type React from "react";
import { useEffect, useState } from "react";
import { array, number, object, string } from "yup";

interface Props {
	isOpen: boolean;
	onClick: () => void;

	isNew?: boolean;
}

interface CreateUserForm {
	domain?: string;
	extension?: string;

	storage: number;
	storageUnit: (typeof STORAGE_UNITS)[number];

	uploadSize: number;
	uploadSizeUnit: (typeof STORAGE_UNITS)[number];

	extensions: string[];
	extensionsMode: "block" | "pass";

	auditlog: number;
	auditlogUnit: (typeof TIME_UNITS_ARRAY)[number];
}

export const CreateUserModal: React.FC<Props> = ({ isNew, isOpen, onClick }) => {
	const [initValues, setInitValues] = useState<CreateUserForm>({
		domain: "",
		extension: "",
		storage: 0,
		storageUnit: "GB",
		uploadSize: 0,
		uploadSizeUnit: "GB",
		extensions: [],
		extensionsMode: "block",
		auditlog: 1,
		auditlogUnit: "mth"
	});
	const [domains, setDomains] = useState<string[]>([]);
	const { data: createGetData } = useSwr<CreateGetApi>("/api/admin/create", undefined, (url) =>
		axios.get(url, { withCredentials: true }).then((res) => res.data)
	);

	useEffect(() => {
		const getStorage = (storage: number): string[] => {
			const res = formatBytes(storage);
			return res.split(/ +/g);
		};

		if (createGetData) {
			const storage = getStorage(createGetData.defaults.maxStorage);
			const upload = getStorage(createGetData.defaults.maxUploadSize);
			const audit = ms(createGetData.defaults.auditlog).split("");

			setInitValues({
				domain: "",
				extension: "",
				extensions: createGetData.defaults.extensions,
				extensionsMode: createGetData.defaults.extensionsMode,
				storage: Number(storage[0]),
				storageUnit: storage[1] as CreateUserForm["storageUnit"],
				uploadSize: Number(upload[0]),
				uploadSizeUnit: upload[1] as CreateUserForm["uploadSizeUnit"],
				auditlog: Number(audit.filter((str) => !isNaN(Number(str))).reduce((a, b) => a + b, "")),
				auditlogUnit: audit.filter((str) => isNaN(Number(str))).join("") as CreateUserForm["auditlogUnit"]
			});

			setDomains(createGetData.domains);
		}
	}, [createGetData]);

	const base = {
		storage: number().required("Storage is a required option").min(0, "Storage cannot be below 0"),
		storageUnit: string()
			.required()
			.oneOf(STORAGE_UNITS as unknown as string[]),
		uploadSize: number().required("Upload size is a required option").min(0, "Upload size cannot be below 0"),
		uploadSizeUnit: string()
			.required()
			.oneOf(STORAGE_UNITS as unknown as string[]),
		extensions: array(string()).min(0).required(),
		extensionsMode: string().required().oneOf(["block", "pass"]),
		auditlog: number().required("Audit log Duration is a required option").min(0, "Audit log duration cannot be below 0"),
		auditlogUnit: string()
			.required()
			.oneOf(TIME_UNITS_ARRAY as unknown as string[])
	};

	const withDomain = {
		...base,
		domain: string()
			.required("A domain is a required option")
			.oneOf(domains ?? []),
		extension: string()
	};

	const schema = object(isNew ? withDomain : base);

	const onSubmit = (values: CreateUserForm) => {
		void 0;
	};

	return (
		<Modal isOpen={isOpen} onClick={onClick}>
			<div className="max-w-[50vw] max-xl:max-w-[75vw] max-md:max-w-[100vw]">
				<div>
					{isNew ? (
						<>
							<h1 className="text-3xl max-md:text-xl">Create a new PaperPlane account</h1>
							<p className="text-base max-w-[90%] max-md:text-small max-md:font-normal">
								Creating an account as admin is always possible, keep in mind that you cannot set a password get access to 2FA code.
								The user will have to use the default back-up code <strong>paperplane-cdn</strong> to login.
							</p>
						</>
					) : (
						<h1 className="text-3xl">Update a PaperPlane account</h1>
					)}
				</div>
				<Formik validationSchema={schema} initialValues={initValues} onSubmit={onSubmit} validateOnMount>
					{(formik) => (
						<Form>
							<ul className="w-full mt-4 max-h-[45vh] pr-2 overflow-y-auto max-sm:max-h-[35vh]">
								{isNew && (
									<li className="w-full">
										<h2 className="text-lg">Choose a domain</h2>
										<div className="flex items-center gap-2 w-full">
											<Input
												type="tertiary"
												placeholder={
													(formik.values.domain ?? "").startsWith("*.") ? "Add a domain extension" : "Not available"
												}
												className="max-sm:w-1/2"
												defaultValue={formik.initialValues.extension ?? ""}
												disabled={!(formik.values.domain ?? "").startsWith("*.")}
												onChange={(ctx) => formik.setFieldValue("extension", ctx.currentTarget.value)}
											/>
											<SelectMenu
												type="tertiary"
												placeholder="Select a domain"
												className="w-full max-sm:w-1/2"
												options={domains.map((domain) => ({ label: domain, value: domain }))}
												onChange={(value) => formik.setFieldValue("domain", (value as SelectOption).value)}
											/>
										</div>
									</li>
								)}
								<li className="w-full mt-4">
									<div className="mb-2">
										<h2 className="text-lg">Max Storage</h2>
										<p className="text-base">
											This allows you to set the Upload Size for PaperPlane accounts when they are created. Note: if you use a
											reverse-proxy like NGINX, make sure to configure an upload limit there too, otherwise this will not work.
										</p>
									</div>
									<div className="flex items-center gap-2 w-full">
										<Input
											type="tertiary"
											formType="number"
											inputMode="decimal"
											placeholder="Storage amount, 0=infinitive"
											className="w-3/4 max-sm:w-1/2"
											defaultValue={formik.initialValues.storage}
											onChange={(ctx) => formik.setFieldValue("storage", Number(ctx.currentTarget.value))}
										/>
										<SelectMenu
											type="tertiary"
											placeholder="Select a unit"
											className="w-1/4 max-sm:w-1/2"
											options={STORAGE_UNITS.map((unit) => ({ value: unit, label: unit }))}
											onChange={(value) => formik.setFieldValue("storageUnit", (value as SelectOption).value)}
											defaultValue={{ label: formik.initialValues.storageUnit, value: formik.initialValues.storageUnit }}
										/>
									</div>
								</li>
								<li className="w-full mt-4">
									<div className="mb-2">
										<h2 className="text-lg">Max Upload Size</h2>
										<p className="text-base">
											This allows you to set the Upload Size for PaperPlane accounts when they are created. Note: if you use a
											reverse-proxy like NGINX, make sure to configure an upload limit there too, otherwise this will not work.
										</p>
									</div>
									<div className="flex items-center gap-2 w-full">
										<Input
											type="tertiary"
											formType="number"
											inputMode="decimal"
											placeholder="Upload size amount, 0=infinitive"
											className="w-3/4 max-sm:w-1/2"
											defaultValue={formik.initialValues.uploadSize}
											onChange={(ctx) => formik.setFieldValue("uploadSize", Number(ctx.currentTarget.value))}
										/>
										<SelectMenu
											type="tertiary"
											placeholder="Select a unit"
											className="w-1/4 max-sm:w-1/2"
											options={STORAGE_UNITS.map((unit) => ({ value: unit, label: unit }))}
											onChange={(value) => formik.setFieldValue("uploadSizeUnit", (value as SelectOption).value)}
											defaultValue={{ label: formik.initialValues.uploadSizeUnit, value: formik.initialValues.uploadSizeUnit }}
										/>
									</div>
								</li>
								<li className="w-full mt-4">
									<div className="mb-2">
										<h2 className="text-lg">(Dis)Allowed Extensions</h2>
										<p className="text-base">
											This will allow you to accept/block the upload of certain file extensions (e.x. .png). Please use the
											following format when using this: <strong>{".<extension>,.<extension>,...etc (e.x.: .png,.jpg)."}</strong>
										</p>
									</div>
									<div className="flex items-center gap-2 w-full">
										<Input
											type="tertiary"
											formType="text"
											inputMode="text"
											placeholder=".<extension>,...etc (e.x.: .png,.jpg)"
											className="w-3/4 max-sm:w-1/2"
											defaultValue={formik.initialValues.extensions.join(",")}
											onChange={(ctx) => formik.setFieldValue("extensions", ctx.currentTarget.value.split(","))}
										/>
										<SelectMenu
											type="tertiary"
											placeholder="Select a mode"
											className="w-1/4 max-sm:w-1/2"
											options={[
												{ label: "Mode: block", value: "block" },
												{ label: "Mode: pass", value: "pass" }
											]}
											onChange={(value) => formik.setFieldValue("extensionsMode", (value as SelectOption).value)}
											defaultValue={{
												label: `Mode: ${formik.initialValues.extensionsMode}`,
												value: formik.initialValues.extensionsMode
											}}
										/>
									</div>
								</li>
								<li className="w-full mt-4">
									<div className="mb-2">
										<h2 className="text-lg">Audit Log Duration</h2>
										<p className="text-base">
											This will determine the for how long the audit logs are visible. By default it is set to 1 month, you can
											use <strong>0</strong> to set it to infinitive (not recommended).
										</p>
									</div>
									<div className="flex items-center gap-2 w-full">
										<Input
											type="tertiary"
											formType="number"
											inputMode="decimal"
											placeholder="Duration, 0=infinitive"
											className="w-3/4 max-sm:w-1/2"
											defaultValue={formik.initialValues.auditlog}
											onChange={(ctx) => formik.setFieldValue("auditlog", Number(ctx.currentTarget.value))}
										/>
										<SelectMenu
											type="tertiary"
											placeholder="Select a unit"
											className="w-1/4 max-sm:w-1/2"
											options={TIME_UNITS}
											defaultValue={TIME_UNITS.find((unit) => unit.value === formik.initialValues.auditlogUnit)}
											onChange={(value) => formik.setFieldValue("auditlogUnit", (value as SelectOption).value)}
										/>
									</div>
								</li>
							</ul>
							<PrimaryButton
								type="button"
								className="mt-4"
								disabled={formik.isSubmitting || !formik.isValid}
								onClick={formik.submitForm}
							>
								Create new user
							</PrimaryButton>
						</Form>
					)}
				</Formik>
			</div>
		</Modal>
	);
};

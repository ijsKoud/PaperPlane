import { PrimaryButton } from "@paperplane/buttons";
import { Input } from "@paperplane/forms";
import { Modal } from "@paperplane/modal";
import type { ApiFile } from "@paperplane/utils";
import { Form, Formik } from "formik";
import type React from "react";
import { useEffect, useState } from "react";
import { PulseLoader } from "react-spinners";
import ReactSwitch from "react-switch";
import { boolean, object, string } from "yup";

interface Props {
	isOpen: boolean;
	file: ApiFile;

	onClick: () => void;
	onSubmit: (...props: any) => void;
}

export const FileEditModal: React.FC<Props> = ({ isOpen, file, onClick, onSubmit }) => {
	const [initialValues, setInitialValues] = useState({ name: file.name, passwordEnabled: file.password, password: "", visible: file.visible });
	const schema = object({
		name: string()
			.required()
			.test({ test: (str) => (str ? !str.includes(".") : false), message: "Name cannot include a . (dot)" }),
		passwordEnabled: boolean().required(),
		password: string().notRequired()
	});

	useEffect(() => {
		setInitialValues({ name: file.name, passwordEnabled: file.password, password: "", visible: file.visible });
	}, []);

	return (
		<Modal isOpen={isOpen} onClick={onClick}>
			<div className="max-w-[50vw] max-xl:max-w-[75vw] max-md:max-w-[100vw]">
				<div>
					<h1 className="text-3xl max-md:text-xl">Edit file details</h1>
					<p className="text-base max-w-[90%] max-md:text-small max-md:font-normal">
						Here you can edit the file name, set a password and toggle the visibility on or off.
					</p>
				</div>
				<Formik validationSchema={schema} initialValues={initialValues} onSubmit={onSubmit} enableReinitialize validateOnMount>
					{(formik) => (
						<Form>
							<ul className="w-full mt-4 max-h-[45vh] pr-2 overflow-y-auto max-sm:max-h-[35vh]">
								<li className="w-full">
									<h2 className="text-lg mb-2">File name</h2>
									<div className="flex items-center gap-2 w-full">
										<div className="w-full">
											<Input
												type="tertiary"
												placeholder="File name here..."
												value={formik.values.name}
												className="w-full"
												onChange={(ctx) => formik.setFieldValue("name", ctx.currentTarget.value)}
											/>
											<p className="text-red text-left text-small font-normal">
												{formik.errors.name && `* ${formik.errors.name}`}&#8203;
											</p>
										</div>
									</div>
								</li>
								<li className="w-full">
									<h2 className="text-lg mb-2">Password</h2>
									<div className="flex items-center gap-2 w-full">
										<div className="w-full">
											<Input
												type="tertiary"
												placeholder="password here..."
												formType="password"
												value={formik.values.password}
												className="w-full"
												onChange={(ctx) => formik.setFieldValue("password", ctx.currentTarget.value)}
											/>
											<p className="text-red text-left text-small font-normal">
												{formik.errors.password && `* ${formik.errors.password}`}&#8203;
											</p>
										</div>
										<div className="w-fit">
											<ReactSwitch
												checkedIcon={false}
												uncheckedIcon={false}
												onChange={(checked) => formik.setFieldValue("passwordEnabled", checked)}
												checked={Boolean(formik.values.password) || formik.values.passwordEnabled}
											/>
											<p className="text-red text-left text-small font-normal">
												{formik.errors.passwordEnabled && `* ${formik.errors.passwordEnabled}`}&#8203;
											</p>
										</div>
									</div>
								</li>
								<li className="w-full">
									<h2 className="text-lg mb-2">Visibility</h2>
									<div className="flex items-center gap-2 w-full">
										<div className="w-fit">
											<ReactSwitch
												checkedIcon={false}
												uncheckedIcon={false}
												onChange={(checked) => formik.setFieldValue("visible", checked)}
												checked={formik.values.visible}
											/>
											<p className="text-red text-left text-small font-normal">
												{formik.errors.visible && `* ${formik.errors.visible}`}&#8203;
											</p>
										</div>
									</div>
								</li>
							</ul>
							<PrimaryButton
								type="button"
								className="mt-4"
								disabled={formik.isSubmitting || !formik.isValid}
								onClick={formik.submitForm}
							>
								{formik.isSubmitting ? <PulseLoader color="#fff" /> : <>Update file</>}
							</PrimaryButton>
						</Form>
					)}
				</Formik>
			</div>
		</Modal>
	);
};

import { PrimaryButton } from "@paperplane/buttons";
import { Input } from "@paperplane/forms";
import { Modal } from "@paperplane/modal";
import { useSwr } from "@paperplane/swr";
import type { DashboardEmbedGetApi } from "@paperplane/utils";
import { Form, Formik, FormikHelpers } from "formik";
import type React from "react";
import { useEffect, useState } from "react";
import { TwitterPicker } from "react-color";
import { PulseLoader } from "react-spinners";
import { object, string } from "yup";

interface Props {
	isOpen: boolean;

	onClick: () => void;
	updateEmbed: (...props: any) => Promise<void>;
}

export const EmbedModal: React.FC<Props> = ({ isOpen, onClick, updateEmbed }) => {
	const [values, setValues] = useState<DashboardEmbedGetApi>({
		title: "",
		description: "Wow, PaperPlane is very cool!",
		color: "#1f2021"
	});

	const { data } = useSwr<DashboardEmbedGetApi>("/api/dashboard/embed", { revalidateOnFocus: false });

	useEffect(() => {
		if (data) setValues(data);
	}, [data]);

	const schema = object({
		title: string().max(256, "Title cannot be longer than 256 characters"),
		description: string().max(4906, "Description cannot be longer than 4906 characters"),
		color: string()
			.required("Color is a required option")
			.test({
				message: "Incorrect color provided",
				test: (str) => (str ? /^#([0-9a-f]{3}){1,2}$/i.test(str) : false)
			})
	});

	const submitForm = async (values: DashboardEmbedGetApi, helpers: FormikHelpers<DashboardEmbedGetApi>) => {
		await updateEmbed(values, helpers);
	};

	return (
		<Modal isOpen={isOpen} onClick={onClick}>
			<div className="w-[60vw] max-xl:w-[80vw]">
				<h1 className="text-3xl">Embed Settings</h1>
				<div className="mt-4 flex gap-2 justify-center flex-col">
					<Formik initialValues={values} validationSchema={schema} onSubmit={submitForm} validateOnMount>
						{(formik) => (
							<Form className="flex flex-col gap-4">
								<ul className="w-full mt-4 max-h-[45vh] pr-2 overflow-y-auto max-sm:max-h-[35vh]">
									<li className="w-full mt-4">
										<div className="mb-2">
											<h2 className="text-lg">Embed Title</h2>
										</div>
										<div className="flex items-center gap-2 w-full">
											<div className="w-3/4 max-lg:w-full">
												<Input
													className="h-[45px] w-full"
													type="primary"
													placeholder="Title here..."
													value={formik.values.title}
													onChange={(ctx) => formik.setFieldValue("title", ctx.currentTarget.value)}
												/>
												<p className="text-red text-left text-small font-normal">
													{formik.errors.title && `* ${formik.errors.title}`}&#8203;
												</p>
											</div>
										</div>
									</li>
									<li className="w-full mt-4">
										<div className="mb-2">
											<h2 className="text-lg">Embed Description</h2>
										</div>
										<div className="flex items-center gap-2 w-full">
											<div className="w-3/4 max-lg:w-full">
												<Input
													className="h-[45px] w-full"
													type="primary"
													placeholder="Description here..."
													value={formik.values.description}
													onChange={(ctx) => formik.setFieldValue("description", ctx.currentTarget.value)}
												/>
												<p className="text-red text-left text-small font-normal">
													{formik.errors.description && `* ${formik.errors.description}`}&#8203;
												</p>
											</div>
										</div>
									</li>
									<li className="w-full mt-4">
										<div className="mb-2">
											<h2 className="text-lg">Embed Color</h2>
										</div>
										<div className="flex items-center gap-2 w-full">
											<div className="w-3/4 max-lg:w-full">
												<TwitterPicker
													triangle="hide"
													className="!bg-main"
													styles={{
														default: {
															hash: {
																height: "28px",
																transform: "translateY(-1px)"
															}
														}
													}}
													color={formik.values.color}
													onChangeComplete={(res) => formik.setFieldValue("color", res.hex)}
												/>
												<p className="text-red text-left text-small font-normal">
													{formik.errors.color && `* ${formik.errors.color}`}&#8203;
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
										{formik.isSubmitting ? <PulseLoader color="#fff" /> : <>Update embed settings</>}
									</PrimaryButton>
									<p className="text-red text-left text-small font-normal">&#8203;</p>
								</div>
							</Form>
						)}
					</Formik>
				</div>
			</div>
		</Modal>
	);
};

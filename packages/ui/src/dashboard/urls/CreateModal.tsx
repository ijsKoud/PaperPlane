import { PrimaryButton, TransparentButton } from "@paperplane/buttons";
import { Input } from "@paperplane/forms";
import { Modal } from "@paperplane/modal";
import { Form, Formik } from "formik";
import type React from "react";
import { PulseLoader } from "react-spinners";
import ShortUniqueId from "short-unique-id";
import { object, string } from "yup";

interface Props {
	isOpen: boolean;

	onClick: () => void;
	createUrl: (...props: any) => void;
}

export const CreateModal: React.FC<Props> = ({ createUrl, ...props }) => {
	const schema = object({
		name: string().notRequired(),
		url: string().url("Must be a URL").required()
	});

	const generateName = (cb: (id: string) => void) => {
		const generator = new ShortUniqueId({ length: 12 });
		const id = generator();

		cb(id);
	};

	return (
		<Modal {...props}>
			<div className="w-[clamp(290px,50vw,750px)] p-4">
				<h1 className="text-3xl">Create a shorturl</h1>
				<Formik validationSchema={schema} initialValues={{ name: "", url: "" }} onSubmit={createUrl} validateOnMount>
					{(formik) => (
						<Form>
							<ul className="w-full mt-4 max-h-[45vh] pr-2 overflow-y-auto max-sm:max-h-[35vh]">
								<li className="w-full">
									<h2 className="text-lg mb-2">Name</h2>
									<div className="flex items-center gap-2 w-full">
										<div className="w-full">
											<div className="w-full flex items-center gap-4">
												<Input
													type="tertiary"
													placeholder="Name here..."
													value={formik.values.name}
													className="w-full"
													onChange={(ctx) => formik.setFieldValue("name", ctx.currentTarget.value)}
												/>
												<TransparentButton
													type="button"
													className="text-2xl text-indigo-500 hover:text-indigo-500 hover:animate-[spin_1s]"
													onClick={() => generateName((id) => formik.setFieldValue("name", id))}
												>
													<i className="fa-solid fa-arrows-rotate" title="Generate name" />
												</TransparentButton>
											</div>
											<p className="text-red text-left text-small font-normal">
												{formik.errors.name && `* ${formik.errors.name}`}&#8203;
											</p>
										</div>
									</div>
								</li>
								<li className="w-full">
									<h2 className="text-lg mb-2">Url</h2>
									<div className="flex items-center gap-2 w-full">
										<div className="w-full">
											<Input
												type="tertiary"
												placeholder="Url here..."
												value={formik.values.url}
												className="w-full"
												onChange={(ctx) => formik.setFieldValue("url", ctx.currentTarget.value)}
											/>
											<p className="text-red text-left text-small font-normal">
												{formik.errors.url && `* ${formik.errors.url}`}&#8203;
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
								{formik.isSubmitting ? <PulseLoader color="#fff" /> : <>Create Url</>}
							</PrimaryButton>
						</Form>
					)}
				</Formik>
			</div>
		</Modal>
	);
};

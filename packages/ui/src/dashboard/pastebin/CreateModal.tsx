import { PrimaryButton, TertiaryButton, TransparentButton } from "@paperplane/buttons";
import { Input, SelectMenu, SelectOption } from "@paperplane/forms";
import { Modal } from "@paperplane/modal";
import { Form, Formik } from "formik";
import type React from "react";
import { useState } from "react";
import { PulseLoader } from "react-spinners";
import SyntaxHighlighter from "react-syntax-highlighter";
import ShortUniqueId from "short-unique-id";
import { boolean, object, string } from "yup";
import { atomOneDark } from "react-syntax-highlighter/dist/cjs/styles/hljs";

interface Props {
	isOpen: boolean;

	onClick: () => void;
	createBin: (...props: any) => void;
}

export const CreatePastebinModal: React.FC<Props> = ({ createBin, ...props }) => {
	const [view, setView] = useState<"editor" | "preview">("editor");
	const schema = object({
		name: string().notRequired(),
		highlight: string().required(),
		visible: boolean().required(),
		data: string().required()
	});

	const generateName = (cb: (id: string) => void) => {
		const generator = new ShortUniqueId({ length: 12 });
		const id = generator();

		cb(id);
	};

	return (
		<Modal {...props}>
			<div className="w-[calc(100vw-100px)] h-[calc(100vh-50px)] p-4">
				<h1 className="text-3xl">Create a pastebin</h1>
				<Formik
					validationSchema={schema}
					initialValues={{ name: "", highlight: "plaintext", visible: true, data: "" }}
					onSubmit={createBin}
					validateOnMount
				>
					{(formik) => (
						<Form>
							<ul className="w-full mt-4 pr-2 overflow-y-auto">
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
									<h2 className="text-lg mb-2">Highlight</h2>
									<div className="flex items-center gap-2 w-full">
										<div className="w-full">
											<SelectMenu
												type="tertiary"
												options={SyntaxHighlighter.supportedLanguages.map((language) => ({
													value: language,
													label: language
												}))}
												value={{ label: formik.values.highlight, value: formik.values.highlight }}
												onChange={(ctx) => formik.setFieldValue("highlight", (ctx as SelectOption).value)}
												className="w-full"
											/>
											<p className="text-red text-left text-small font-normal">
												{formik.errors.highlight && `* ${formik.errors.highlight}`}&#8203;
											</p>
										</div>
									</div>
								</li>
								<li className="w-full">
									<h2 className="text-lg mb-2">Visibility</h2>
									<div className="flex items-center gap-2 w-full">
										<div className="w-fit">
											<input
												type="checkbox"
												checked={formik.values.visible}
												onChange={(ctx) => formik.setFieldValue("visible", ctx.currentTarget.checked)}
											/>
											<p className="text-red text-left text-small font-normal">
												{formik.errors.visible && `* ${formik.errors.visible}`}&#8203;
											</p>
										</div>
									</div>
								</li>
								<li className="w-full">
									<h2 className="text-lg mb-2">Editor</h2>
									<div className="w-full flex items-center gap-2 mb-4 ml-1">
										<TertiaryButton type="button" onClick={() => setView("editor")}>
											Editor
										</TertiaryButton>
										<TertiaryButton type="button" onClick={() => setView("preview")}>
											Preview
										</TertiaryButton>
									</div>
									<div className="flex items-center gap-2 w-full">
										<div className="w-full">
											{view === "editor" && (
												<textarea
													value={formik.values.data}
													onChange={(ctx) => formik.setFieldValue("data", ctx.currentTarget.value)}
													className="ml-1 p-2 w-full resize-y bg-highlight-200 border-highlight-600 rounded-xl border outline-transparent outline-2 outline focus:outline-highlight transition-all"
												/>
											)}
											{view === "preview" && (
												<SyntaxHighlighter language={formik.values.highlight} style={atomOneDark} showLineNumbers>
													{formik.values.data}
												</SyntaxHighlighter>
											)}
											<p className="text-red text-left text-small font-normal">
												{formik.errors.data && `* ${formik.errors.data}`}&#8203;
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
								{formik.isSubmitting ? <PulseLoader color="#fff" /> : <>Create pastebin</>}
							</PrimaryButton>
						</Form>
					)}
				</Formik>
			</div>
		</Modal>
	);
};

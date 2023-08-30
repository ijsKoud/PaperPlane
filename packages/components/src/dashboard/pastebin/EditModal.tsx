import { PrimaryButton, TertiaryButton, TransparentButton } from "@paperplane/buttons";
import { Input, SelectMenu, type SelectOption } from "@paperplane/forms";
import { Modal } from "@paperplane/modal";
import { Form, Formik } from "formik";
import type React from "react";
import { useState } from "react";
import { PulseLoader } from "react-spinners";
import SyntaxHighlighter from "react-syntax-highlighter";
import ShortUniqueId from "short-unique-id";
import { boolean, object, string } from "yup";
import { atomOneDark } from "react-syntax-highlighter/dist/cjs/styles/hljs";
import type { ApiBin } from "@paperplane/utils";
import { useSwr } from "@paperplane/swr";

interface Props {
	isOpen: boolean;
	bin: ApiBin;

	onClick: () => void;
	onSubmit: (...props: any) => Promise<void>;
}

export const EditPastebinModal: React.FC<Props> = ({ onSubmit, bin, ...props }) => {
	const [view, setView] = useState<"editor" | "preview">("editor");
	const schema = object({
		name: string().required(),
		highlight: string().required(),
		visible: boolean().required(),
		data: string().required(),
		password: string().notRequired(),
		passwordEnabled: boolean().required()
	});

	const generateName = (cb: (id: string) => void) => {
		const generator = new ShortUniqueId({ length: 12 });
		const id = generator();

		cb(id);
	};

	const { data: binData, mutate } = useSwr<string>(`/api/dashboard/paste-bins/${bin.name}`);
	const onSubmitHandle = async (...props: any) => {
		await onSubmit(...props);
		void mutate(props.values.data);
	};

	return (
		<Modal {...props}>
			<div className="w-[calc(100vw-100px)] h-[calc(100vh-50px)] p-4">
				<h1 className="text-3xl">Create a pastebin</h1>
				<Formik
					validationSchema={schema}
					initialValues={{
						name: bin.name,
						highlight: bin.highlight,
						visible: bin.visible,
						passwordEnabled: bin.password,
						password: "",
						data: binData ?? ""
					}}
					onSubmit={onSubmitHandle}
					validateOnMount
				>
					{(formik) => (
						<Form>
							<ul className="w-full mt-4 pr-2 overflow-y-auto max-h-[calc(100vh-250px)]">
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
									<h2 className="text-lg mb-2">Password</h2>
									<div className="flex items-center gap-2 w-full">
										<div className="w-fit">
											<Input
												type="tertiary"
												placeholder="Password here..."
												value={formik.values.password}
												onChange={(ctx) => formik.setFieldValue("password", ctx.currentTarget.value)}
											/>
											<p className="text-red text-left text-small font-normal">
												{formik.errors.password && `* ${formik.errors.password}`}&#8203;
											</p>
										</div>
										<div className="w-fit">
											<input
												type="checkbox"
												checked={formik.values.passwordEnabled}
												onChange={(ctx) => formik.setFieldValue("passwordEnabled", ctx.currentTarget.checked)}
											/>
											<p className="text-red text-left text-small font-normal">
												{formik.errors.passwordEnabled && `* ${formik.errors.passwordEnabled}`}&#8203;
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
												{formik.errors.data && `* ${formik.errors.data as string}`}&#8203;
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
								{formik.isSubmitting ? <PulseLoader color="#fff" /> : <>Update pastebin</>}
							</PrimaryButton>
						</Form>
					)}
				</Formik>
			</div>
		</Modal>
	);
};

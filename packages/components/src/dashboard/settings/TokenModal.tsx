import { PrimaryButton } from "@paperplane/buttons";
import { Input } from "@paperplane/forms";
import { Modal } from "@paperplane/modal";
import { Form, Formik, type FormikHelpers } from "formik";
import type React from "react";
import { useEffect, useState } from "react";
import { PulseLoader } from "react-spinners";
import { object, string } from "yup";

interface Props {
	isOpen: boolean;

	onClick: () => void;
	generateToken: (...props: any) => Promise<string | undefined>;
}

export const TokenModal: React.FC<Props> = ({ isOpen, onClick, generateToken }) => {
	const schema = object({
		name: string().required("A Token name is required")
	});

	const [showToken, setShowToken] = useState("");
	const submitForm = async (values: { name: string }, helpers: FormikHelpers<{ name: string }>) => {
		const token = await generateToken(values, helpers);
		if (token) setShowToken(token);
	};

	useEffect(() => {
		setShowToken("");
	}, [isOpen]);

	return (
		<Modal isOpen={isOpen} onClick={onClick}>
			{showToken.length ? (
				<div className="w-[60vw] max-xl:w-[80vw]">
					<h1 className="text-3xl">Your new API Token</h1>
					<p className="text-base">You will only be able to see this token once.</p>
					<div className="mt-8 bg-main w-full p-4 rounded-xl">
						<p className="text-base italic">{showToken}</p>
					</div>
				</div>
			) : (
				<div className="w-[60vw] max-xl:w-[80vw]">
					<h1 className="text-3xl">Generate new API Token</h1>
					<div className="mt-4 flex gap-2 justify-center flex-col">
						<Formik initialValues={{ name: "" }} validationSchema={schema} onSubmit={submitForm} validateOnMount>
							{(formik) => (
								<Form className="flex items-center justify-between w-full max-lg:flex-col">
									<div className="w-3/4 max-lg:w-full">
										<Input
											className="h-[45px] w-full"
											type="primary"
											placeholder="Token name, example: shareX token"
											value={formik.values.name}
											onChange={(ctx) => formik.setFieldValue("name", ctx.currentTarget.value)}
										/>
										<p className="text-red text-left text-small font-normal">
											{formik.errors.name && `* ${formik.errors.name}`}&#8203;
										</p>
									</div>
									<div className="w-fit max-lg:w-full">
										<PrimaryButton
											type="button"
											className="max-lg:w-full"
											disabled={formik.isSubmitting || !formik.isValid}
											onClick={formik.submitForm}
										>
											{formik.isSubmitting ? <PulseLoader color="#fff" /> : <>Create new token</>}
										</PrimaryButton>
										<p className="text-red text-left text-small font-normal">&#8203;</p>
									</div>
								</Form>
							)}
						</Formik>
					</div>
				</div>
			)}
		</Modal>
	);
};

import { Field, Formik, Form as FormikForm } from "formik";
import React from "react";
import { toast } from "react-toastify";
import { object, string } from "yup";
import { fetch } from "../../../../lib/fetch";
import type { FC } from "../../../../lib/types";
import Button from "../../../general/Button";
import Loader from "../../../general/Loader";
import Modal from "../../../general/Modal";

interface Props {
	onClick: () => void;
	updateFileList: () => void;

	isOpen: boolean;
	name: string;
}

interface FormProps {
	name: string;
	onClick: () => void;
	updateFileList: () => void;
}

const Form: FC<FormProps> = ({ name, updateFileList, onClick }) => {
	const validationSchema = object({
		name: string().required("Required"),
		password: string().optional()
	});

	const onSubmit = async ({ name: newName, password }: { name: string; password: string }) => {
		try {
			const deletePromise = fetch("/api/dashboard/files/update", undefined, { method: "POST", data: { name, newName, password } });
			await toast.promise(deletePromise, {
				error: "Unable to update the file, please try again later.",
				success: `Successfully updated ${name}`,
				pending: `Attempting to update ${name}`
			});
		} catch (err) {}

		updateFileList();
		onClick();
	};

	return (
		<Formik
			validationSchema={validationSchema}
			validateOnMount
			validateOnChange
			onSubmit={onSubmit}
			initialValues={{
				name,
				password: ""
			}}
		>
			{({ errors, isValid, isSubmitting }) => (
				<FormikForm className="credentials">
					<div className="credentials-item">
						<Field as="input" id="name" name="name" placeholder="example.ext" />
						<p className="credentials-error">{errors.name ?? <wbr />}</p>
					</div>
					<div className="credentials-item">
						<Field as="input" type="password" id="password" name="password" placeholder="super secret password" />
						<p className="credentials-error">{errors.password ?? <wbr />}</p>
					</div>
					{isSubmitting ? (
						<Loader size={30} />
					) : (
						<button className="credentials-submit" type="submit" disabled={!isValid}>
							Update
						</button>
					)}
				</FormikForm>
			)}
		</Formik>
	);
};

const FileEditModal: FC<Props> = ({ onClick, isOpen, name, updateFileList }) => {
	return (
		<Modal {...{ onClick, isOpen }}>
			<div className="upload-modal-content">
				<div className="upload-modal-top">
					<h1 className="upload-modal-title">Update a file</h1>
					<Button type="button" style="text" onClick={onClick}>
						<i className="fa-solid fa-times" />
					</Button>
				</div>
				<Form {...{ name, updateFileList, onClick }} />
			</div>
		</Modal>
	);
};

export default FileEditModal;

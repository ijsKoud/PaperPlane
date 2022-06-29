import { Field, Formik, Form as FormikForm, FastFieldProps } from "formik";
import React from "react";
import ReactSwitch from "react-switch";
import { toast } from "react-toastify";
import { boolean, object, string } from "yup";
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
	visible: boolean;
	password: string;
}

interface FormProps {
	name: string;
	visible: boolean;
	password: string;

	onClick: () => void;
	updateFileList: () => void;
}

const Form: FC<FormProps> = ({ name, password, visible, updateFileList, onClick }) => {
	const validationSchema = object({
		name: string().required("Required"),
		visible: boolean().required(),
		password: string().optional()
	});

	const onSubmit = async ({ name: newName, password: pwd, visible }: { name: string; password: string; visible: boolean }) => {
		try {
			pwd ??= "";
			const deletePromise = fetch("/api/dashboard/files/update", undefined, {
				method: "POST",
				data: { name, newName, password: pwd, visible }
			});
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
				visible,
				password
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
					<div className="credentials-item">
						<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
							<p style={{ fontSize: 25 }}>Visible to everyone:</p>
							<Field id="visible" name="visible">
								{({ form, field }: FastFieldProps<boolean>) => (
									<ReactSwitch
										checkedIcon={false}
										uncheckedIcon={false}
										onChange={(checked) => form.setFieldValue("visible", checked)}
										checked={field.value}
									/>
								)}
							</Field>
						</div>
						<p className="credentials-error">{errors.visible ?? <wbr />}</p>
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

const FileEditModal: FC<Props> = ({ onClick, isOpen, name, password, visible, updateFileList }) => {
	return (
		<Modal {...{ onClick, isOpen }}>
			<div className="upload-modal-content">
				<div className="upload-modal-top">
					<h1 className="upload-modal-title">Update a file</h1>
					<Button type="button" style="text" onClick={onClick}>
						<i className="fa-solid fa-times" />
					</Button>
				</div>
				<Form {...{ name, password, visible, updateFileList, onClick }} />
			</div>
		</Modal>
	);
};

export default FileEditModal;

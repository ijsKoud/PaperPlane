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
	updateURLList: () => void;

	isOpen: boolean;
	name: string;
	visible: boolean;
}

interface FormProps {
	name: string;
	visible: boolean;

	onClick: () => void;
	updateURLList: () => void;
}

const Form: FC<FormProps> = ({ name, visible, updateURLList, onClick }) => {
	const validationSchema = object({
		name: string().required("Required"),
		visible: boolean().required()
	});

	const onSubmit = async ({ name: newName, visible }: { name: string; visible: boolean }) => {
		try {
			const deletePromise = fetch("/api/dashboard/urls/update", undefined, { method: "POST", data: { name, newName, visible } });
			await toast.promise(deletePromise, {
				error: "Unable to update the url, please try again later.",
				success: `Successfully updated ${name}`,
				pending: `Attempting to update ${name}`
			});
		} catch (err) {}

		updateURLList();
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
				visible
			}}
		>
			{({ errors, isValid, isSubmitting }) => (
				<FormikForm className="credentials">
					<div className="credentials-item">
						<Field as="input" id="name" name="name" placeholder="example.ext" />
						<p className="credentials-error">{errors.name ?? <wbr />}</p>
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

const URLEditModal: FC<Props> = ({ onClick, isOpen, name, visible, updateURLList }) => {
	return (
		<Modal {...{ onClick, isOpen }}>
			<div className="upload-modal-content">
				<div className="upload-modal-top">
					<h1 className="upload-modal-title">Update a file</h1>
					<Button type="button" style="text" onClick={onClick}>
						<i className="fa-solid fa-times" />
					</Button>
				</div>
				<Form {...{ name, visible, updateURLList, onClick }} />
			</div>
		</Modal>
	);
};

export default URLEditModal;

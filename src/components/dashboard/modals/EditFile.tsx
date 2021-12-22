import { Formik, Form, Field } from "formik";
import React from "react";
import { object, string } from "yup";
import { PulseLoader } from "react-spinners";
import { fetch } from "../../../lib";

interface Props {
	handleClose: () => void;
	name: string;
}

const EditFile: React.FC<Props> = ({ handleClose, name }) => {
	const validationSchema = object({
		name: string().max(255, "File name is too long").required("Item is required")
	});

	const submit = async (data: { name: string }) => {
		await fetch("/api/file/", undefined, { method: "PATCH", data: { newName: data.name, oldName: name } });
		handleClose();
	};

	return (
		<div className="edit-wrapper">
			<i className="fas fa-times" onClick={handleClose} />
			<Formik onSubmit={submit} initialValues={{ name }} validationSchema={validationSchema} validateOnMount validateOnChange>
				{({ isValid, isSubmitting, errors }) => (
					<Form className="edit-container">
						{isSubmitting ? (
							<PulseLoader color="#fff" />
						) : (
							<>
								<p>New file name</p>
								<Field as="input" id="name" name="name" placeholder="name..." style={{ width: "90%" }} />
								<span>{errors.name}</span>
								<button disabled={!isValid} type="submit">
									<i className="fas fa-save" /> Save
								</button>
							</>
						)}
					</Form>
				)}
			</Formik>
		</div>
	);
};

export default EditFile;

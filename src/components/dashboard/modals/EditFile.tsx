import { Formik, Form, Field } from "formik";
import React from "react";
import { object, string } from "yup";
import { ApiError, fetch } from "../../../lib";
import type { AxiosError } from "axios";
import { alert, success } from "../../../lib/notifications";
import PulseLoader from "../../general/PulseLoader";

interface Props {
	handleClose: () => void;
	name: string;
}

const EditFile: React.FC<Props> = ({ handleClose, name }) => {
	const validationSchema = object({
		name: string().max(255, "File name is too long").required("Item is required")
	});

	const submit = async (data: { name: string }) => {
		try {
			await fetch("/api/files", undefined, { method: "PATCH", data: { newName: data.name, oldName: name } });
			success("File renamed", `${name} successfully renamed to ${data.name}`);
		} catch (err) {
			if (!err) return;
			if (typeof err === "object" && "isAxiosError" in err) {
				const error = err as AxiosError<ApiError>;
				alert("Error while renaming the file", error.response?.data.message ?? "Unknown error, please try again later");
			}
		}
		handleClose();
	};

	return (
		<div className="edit-wrapper">
			<i className="fas fa-times" onClick={handleClose} />
			<Formik onSubmit={submit} initialValues={{ name }} validationSchema={validationSchema} validateOnMount validateOnChange>
				{({ isValid, isSubmitting, errors }) => (
					<Form className="edit-container">
						{isSubmitting ? (
							<PulseLoader />
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

import { Formik, Form, Field } from "formik";
import React from "react";
import { object, string } from "yup";
import { PulseLoader } from "react-spinners";
import { fetch, LinkStats } from "../../../lib";

interface Props {
	handleClose: () => void;
	link: LinkStats;
}

const EditLink: React.FC<Props> = ({ handleClose, link }) => {
	const validationSchema = object({
		url: string().url("Item must be a URL").required("Item is required"),
		path: string().min(3, "Must be 3 characters or longer").max(20, "Shortlink code is too long").required("Item is required")
	});

	const submit = async (data: { url: string; path: string }) => {
		await fetch(`/api/url`, undefined, { method: "PATCH", data: { newData: data, oldPath: link.path } });
		handleClose();
	};

	return (
		<div className="edit-wrapper">
			<i className="fas fa-times" onClick={handleClose} />
			<Formik
				onSubmit={submit}
				initialValues={{ url: link.url, path: link.path }}
				validationSchema={validationSchema}
				validateOnMount
				validateOnChange
			>
				{({ isValid, isSubmitting, errors }) => (
					<Form className="edit-container">
						{isSubmitting ? (
							<PulseLoader color="#fff" />
						) : (
							<>
								<p>Shortlink Code</p>
								<Field as="input" id="path" name="path" placeholder="code..." style={{ width: "90%" }} />
								<span>{errors.path}</span>
								<p>URL</p>
								<Field as="input" id="url" type="url" name="url" placeholder="url..." style={{ width: "90%" }} />
								<span>{errors.url}</span>
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

export default EditLink;

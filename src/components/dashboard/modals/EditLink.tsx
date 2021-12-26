import type { AxiosError } from "axios";
import { Formik, Form, Field } from "formik";
import React from "react";
import { object, string } from "yup";
import { ApiError, fetch, LinkStats } from "../../../lib";
import { alert } from "../../../lib/notifications";
import PulseLoader from "../../general/PulseLoader";

interface Props {
	handleClose: () => void;
	link: LinkStats;
}

const EditLink: React.FC<Props> = ({ handleClose, link }) => {
	const validationSchema = object({
		url: string().url("Item must be a URL").required("Item is required"),
		id: string().min(3, "Must be 3 characters or longer").max(20, "Shortlink code is too long").required("Item is required")
	});

	const submit = async (data: { url: string; id: string }) => {
		try {
			await fetch(`/api/links`, undefined, { method: "PATCH", data: { newData: data, oldPath: link.id } });
		} catch (error) {
			if (!error || typeof error !== "object" || !("isAxiosError" in error)) return;

			const err = error as AxiosError<ApiError>;
			alert("Unable to update the url", `${err.response?.data.message ?? "Unknown error, please try again later"}`);
		}

		handleClose();
	};

	return (
		<div className="edit-wrapper">
			<i className="fas fa-times" onClick={handleClose} />
			<Formik
				onSubmit={submit}
				initialValues={{ url: link.url, id: link.id }}
				validationSchema={validationSchema}
				validateOnMount
				validateOnChange
			>
				{({ isValid, isSubmitting, errors }) => (
					<Form className="edit-container">
						{isSubmitting ? (
							<PulseLoader />
						) : (
							<>
								<p>Shortlink Code</p>
								<Field as="input" id="id" name="id" placeholder="code..." style={{ width: "90%" }} />
								<span>{errors.id}</span>
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

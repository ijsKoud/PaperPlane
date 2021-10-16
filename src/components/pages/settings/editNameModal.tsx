import { Formik, Form, Field } from "formik";
import React from "react";
import { fetch } from "../../../lib/fetch";
import { useAuth } from "../../../lib/hooks/useAuth";
import { object, string } from "yup";
import { ThreeDots } from "@agney/react-loading";

interface Props {
	handleClose: () => void;
}

const EditNameModal: React.FC<Props> = ({ handleClose }) => {
	const { user, fetch: FetchUser } = useAuth();

	const validationSchema = object({
		username: string()
			.min(5, "Username is too short")
			.max(32, "Username is too long")
			.required("Username is required"),
	});

	const submit = async (data: { username: string }) => {
		await fetch("/user/update", { method: "PUT", data: { username: data.username } });
		FetchUser();
		handleClose();
	};

	return (
		<div className="edit-wrapper">
			<i className="fas fa-times" onClick={handleClose} />
			<Formik
				onSubmit={submit}
				initialValues={{ username: user?.username ?? "" }}
				validationSchema={validationSchema}
				validateOnMount
				validateOnChange>
				{({ isValid, isSubmitting, errors }) => (
					<Form className="edit-container">
						{isSubmitting ? (
							<ThreeDots style={{ width: "100px" }} />
						) : (
							<>
								<p>New username</p>
								<Field
									as="input"
									id="username"
									name="username"
									placeholder="username..."
									style={{ width: "90%" }}
								/>
								<span>{errors.username}</span>
								<button disabled={!isValid} type="submit">
									<i className="fas fa-save" /> Update
								</button>
							</>
						)}
					</Form>
				)}
			</Formik>
		</div>
	);
};

export default EditNameModal;

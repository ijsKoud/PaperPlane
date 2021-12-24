import { Formik, Form, Field } from "formik";
import React from "react";
import { fetch } from "../../../lib/fetch";
import { useAuth } from "../../../lib/hooks/useAuth";
import { object, string } from "yup";
import PulseLoader from "../../general/PulseLoader";
import type { AxiosError } from "axios";
import type { ApiError } from "../../../lib";
import { alert } from "../../../lib/notifications";

interface Props {
	handleClose: () => void;
}

const EditNameModal: React.FC<Props> = ({ handleClose }) => {
	const { user, fetch: FetchUser } = useAuth();

	const validationSchema = object({
		username: string().min(5, "Username is too short").max(32, "Username is too long").required("Username is required")
	});

	const submit = async (data: { username: string }) => {
		try {
			const res = await fetch<{ token: string }>("/api/user", undefined, { method: "PATCH", data: { username: data.username } });
			localStorage.setItem("PAPERPLANE_AUTH", res.data.token);

			FetchUser();
		} catch (error) {
			if (!error || typeof error !== "object" || !("isAxiosError" in error)) return;

			const err = error as AxiosError<ApiError>;
			alert("Unable to update the username", `${err.response?.data.message ?? "Unknown error, please try again later"}`);
		}

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
				validateOnChange
			>
				{({ isValid, isSubmitting, errors }) => (
					<Form className="edit-container">
						{isSubmitting ? (
							<PulseLoader />
						) : (
							<>
								<p>New username</p>
								<Field as="input" id="username" name="username" placeholder="username..." style={{ width: "90%" }} />
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

import { Formik, Form, Field } from "formik";
import React, { useState } from "react";
import { fetch } from "../../../lib/fetch";
import { useAuth } from "../../../lib/hooks/useAuth";
import { object, string } from "yup";
import PulseLoader from "../../general/PulseLoader";
import type { ApiError } from "../../../lib";
import type { AxiosError } from "axios";
import { alert } from "../../../lib/notifications";

interface Props {
	handleClose: () => void;
}

const EditPasswordModal: React.FC<Props> = ({ handleClose }) => {
	const { fetch: FetchUser } = useAuth();
	const [show, setShow] = useState(false);

	const validationSchema = object({
		password: string().min(5, "Password is too short").required("Password is required")
	});

	const submit = async (data: { password: string }) => {
		try {
			const res = await fetch<{ token: string }>("/api/user", undefined, { method: "PATCH", data: { password: data.password } });
			localStorage.setItem("PAPERPLANE_AUTH", res.data.token);

			FetchUser();
		} catch (error) {
			if (!error || typeof error !== "object" || !("isAxiosError" in error)) return;

			const err = error as AxiosError<ApiError>;
			alert("Unable to update the password", `${err.response?.data.message ?? "Unknown error, please try again later"}`);
		}

		handleClose();
	};

	return (
		<div className="edit-wrapper">
			<i className="fas fa-times" onClick={handleClose} />
			<Formik onSubmit={submit} initialValues={{ password: "" }} validationSchema={validationSchema} validateOnMount validateOnChange>
				{({ isValid, isSubmitting, errors }) => (
					<Form className="edit-container">
						{isSubmitting ? (
							<PulseLoader />
						) : (
							<>
								<p>New password</p>
								<div className="settings-password">
									<Field
										as="input"
										type={show ? "text" : "password"}
										id="password"
										name="password"
										placeholder="password..."
										style={{ width: "90%" }}
									/>
									<button className="settings-button" onClick={() => setShow(!show)}>
										<i className={show ? "fas fa-eye-slash" : "fas fa-eye"} />
									</button>
								</div>
								<span>{errors.password}</span>
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

export default EditPasswordModal;

import { Formik, Form, Field } from "formik";
import React, { useState } from "react";
import { fetch } from "../../../lib/fetch";
import { useAuth } from "../../../lib/hooks/useAuth";
import { object, string } from "yup";
import { ThreeDots } from "@agney/react-loading";

interface Props {
	handleClose: () => void;
}

const EditPasswordModal: React.FC<Props> = ({ handleClose }) => {
	const { fetch: FetchUser } = useAuth();
	const [show, setShow] = useState(false);

	const validationSchema = object({
		password: string().min(5, "Password is too short").required("Password is required"),
	});

	const submit = async (data: { password: string }) => {
		await fetch("/user/update", { method: "PUT", data: { password: data.password } });
		FetchUser();
		handleClose();
	};

	return (
		<div className="edit-wrapper">
			<i className="fas fa-times" onClick={handleClose} />
			<Formik
				onSubmit={submit}
				initialValues={{ password: "" }}
				validationSchema={validationSchema}
				validateOnMount
				validateOnChange>
				{({ isValid, isSubmitting, errors }) => (
					<Form className="edit-container">
						{isSubmitting ? (
							<ThreeDots style={{ width: "100px" }} />
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
									<i
										className={show ? "fas fa-eye-slash" : "fas fa-eye"}
										onClick={() => setShow(!show)}
									/>
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

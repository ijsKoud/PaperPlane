import { Field, Form as FormikForm, Formik } from "formik";
import { object, string } from "yup";
import React, { useState } from "react";
import ToolTip from "../../general/ToolTip";
import Loader from "../../general/Loader";
import type { FC, LoginCreds } from "../../../lib/types";

interface Props {
	onSubmit: (data: LoginCreds) => void | Promise<void>;
}

const Form: FC<Props> = ({ onSubmit }) => {
	const [show, setShow] = useState(false);

	const validationSchema = object({
		username: string().required("Required").max(32, "Username cannot be longer than 32 characters"),
		password: string().required("Required").min(5, "Password must be 5 characters or longer")
	});

	return (
		<Formik
			validationSchema={validationSchema}
			validateOnMount
			validateOnChange
			onSubmit={onSubmit}
			initialValues={{
				username: "",
				password: ""
			}}
		>
			{({ errors, isValid, isSubmitting }) => (
				<FormikForm className="credentials">
					<h1>Login</h1>
					<div className="credentials-item">
						<Field as="input" id="username" name="username" placeholder="username..." />
						<p className="credentials-error">{errors.username ?? <wbr />}</p>
					</div>
					<div className="credentials-item">
						<div className="credentials-password">
							<Field
								as="input"
								type={show ? "text" : "password"}
								id="password"
								name="password"
								placeholder="password..."
								style={{ width: "90%" }}
							/>
							<ToolTip content="Show password">
								<button onClick={() => setShow(!show)} type="button">
									<i className={show ? "fas fa-eye-slash" : "fas fa-eye"} />
								</button>
							</ToolTip>
						</div>
						<p className="credentials-error">{errors.password ?? <wbr />}</p>
					</div>
					{isSubmitting ? (
						<Loader size={30} />
					) : (
						<button className={"credentials-submit"} type="submit" disabled={!isValid}>
							Login
						</button>
					)}
				</FormikForm>
			)}
		</Formik>
	);
};

export default Form;

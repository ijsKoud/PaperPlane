import { Field, Form as FormikForm, Formik } from "formik";
import { object, string } from "yup";
import React, { useState } from "react";
import ToolTip from "../../general/ToolTip";
import Loader from "../../general/Loader";
import type { FC } from "../../../lib/types";

interface Props {
	onSubmit: (data: { password: string }) => void | Promise<void>;
}

const Form: FC<Props> = ({ onSubmit }) => {
	const [show, setShow] = useState(false);

	const validationSchema = object({
		password: string().required("Required")
	});

	return (
		<Formik
			validationSchema={validationSchema}
			validateOnMount
			validateOnChange
			onSubmit={onSubmit}
			initialValues={{
				password: ""
			}}
		>
			{({ errors, isValid, isSubmitting }) => (
				<FormikForm className="credentials">
					<h1>Login</h1>
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

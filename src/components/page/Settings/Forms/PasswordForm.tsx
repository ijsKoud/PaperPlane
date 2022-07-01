import { setCookies } from "cookies-next";
import { Field, Form, Formik } from "formik";
import React from "react";
import { toast } from "react-toastify";
import { object, string } from "yup";
import { fetch } from "../../../../lib/fetch";
import { useAuth } from "../../../../lib/hooks/useAuth";
import type { FC } from "../../../../lib/types";

interface OnSubmitTypes {
	password: string;
}

const PasswordForm: FC = () => {
	const { user, fetch: refetch } = useAuth();

	const schema = object({
		password: string().min(5, "Password must be at least 5 characters long")
	});

	const onSubmit = async (data: OnSubmitTypes) => {
		try {
			const embedPromise = fetch<{ token: string }>("/api/user", undefined, { method: "PATCH", data });
			await toast.promise(embedPromise, {
				error: "Unable to update the password, please try again later.",
				success: "Successfully the password",
				pending: "Attempting to update the password"
			});

			embedPromise
				.then((res) => setCookies("PAPERPLANE_AUTH", res.data.token, { maxAge: 31556952e3 }))
				.then(() => setTimeout(() => refetch(), 1e3))
				.catch(() => void 0);
		} catch (err) {}
	};

	return user ? (
		<Formik
			validateOnChange
			validateOnMount
			validationSchema={schema}
			onSubmit={onSubmit}
			initialValues={{
				password: ""
			}}
		>
			{({ errors, isValid }) => (
				<Form style={{ display: "flex" }}>
					<div>
						<Field className="embed-settings-text" type="password" id="password" name="password" placeholder="Password..." />
						<p>{errors.password}</p>
					</div>
					<button className="button button-blurple" style={{ marginLeft: "1rem" }} type="submit" disabled={!isValid}>
						<i className="fas fa-save" /> Save
					</button>
				</Form>
			)}
		</Formik>
	) : null;
};

export default PasswordForm;

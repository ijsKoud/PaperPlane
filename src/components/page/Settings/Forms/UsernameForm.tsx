import { setCookie } from "cookies-next";
import { Field, Form, Formik } from "formik";
import React from "react";
import { toast } from "react-toastify";
import { object, string } from "yup";
import { fetch } from "../../../../lib/fetch";
import { useAuth } from "../../../../lib/hooks/useAuth";
import type { FC } from "../../../../lib/types";

interface OnSubmitTypes {
	username: string;
}

const UsernameForm: FC = () => {
	const { user, fetch: refetch } = useAuth();

	const schema = object({
		username: string().max(32, "Username must not be longer than 32 characters.")
	});

	const onSubmit = async (data: OnSubmitTypes) => {
		try {
			const embedPromise = fetch<{ token: string }>("/api/user", undefined, { method: "PATCH", data });
			await toast.promise(embedPromise, {
				error: "Unable to update the username, please try again later.",
				success: `Successfully updated the username to ${data.username}`,
				pending: "Attempting to update the username"
			});

			embedPromise
				.then((res) => setCookie("PAPERPLANE_AUTH", res.data.token, { maxAge: 31556952e3 }))
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
				username: user.username
			}}
		>
			{({ errors, isValid }) => (
				<Form style={{ display: "flex" }}>
					<div>
						<Field className="embed-settings-text" id="username" name="username" />
						<p>{errors.username}</p>
					</div>
					<button className="button button-blurple" style={{ marginLeft: "1rem" }} type="submit" disabled={!isValid}>
						<i className="fas fa-save" /> Save
					</button>
				</Form>
			)}
		</Formik>
	) : null;
};

export default UsernameForm;

import { Field, Form as FormikForm, Formik } from "formik";
import { object, string } from "yup";
import React, { useState } from "react";
import Loader from "../../../../general/Loader";
import type { ApiError, FC } from "../../../../../lib/types";
import { fetch } from "../../../../../lib/fetch";
import { useAuth } from "../../../../../lib/hooks/useAuth";
import type { AxiosError } from "axios";

const Form: FC = () => {
	const [error, setError] = useState("");
	const { user } = useAuth();

	const validationSchema = object({
		short: string().required("Required").url("A valid URL must be provided"),
		path: string().required("Required")
	});

	const onSubmit = async ({ short, path }: { short: string; path: string }) => {
		const data = new FormData();
		data.append("short", short);
		data.append("path", path);

		try {
			// TODO: ADD NOTIFICATION WITH CORRECT URL
			await fetch("/api/upload", undefined, {
				method: "POST",
				data,
				headers: { Authorization: user?.token ?? "", "Content-Type": "multipart/form-data" }
			});
		} catch (err) {
			if (!err || typeof err !== "object") return;
			if (err instanceof Error && err.message === "cancelled") return;
			if (!("isAxiosError" in err)) return;

			const _err = err as AxiosError<ApiError>;
			console.error(_err);
			setError(_err.response?.data.message ?? "An unknown error occurred, please try again later.");
			// alert("Something went wrong while uploading a file", err.response?.data.message ?? "Unknown error, please try again later.");
		}
	};

	return (
		<Formik
			validationSchema={validationSchema}
			validateOnMount
			validateOnChange
			onSubmit={onSubmit}
			initialValues={{
				short: "",
				path: ""
			}}
		>
			{({ errors, isValid, isSubmitting }) => (
				<FormikForm className="credentials">
					<div className="credentials-item">
						<Field as="input" id="short" name="short" placeholder="https://example.com/" />
						<p className="credentials-error">{errors.short ?? <wbr />}</p>
					</div>
					<div className="credentials-item">
						<Field as="input" id="path" name="path" placeholder="example" />
						<p className="credentials-error">{errors.path ?? <wbr />}</p>
					</div>
					{isSubmitting ? (
						<Loader size={30} />
					) : (
						<>
							<p className="credentials-error">{error ?? <wbr />}</p>
							<button className={"credentials-submit"} type="submit" disabled={!isValid}>
								Create
							</button>
						</>
					)}
				</FormikForm>
			)}
		</Formik>
	);
};

export default Form;

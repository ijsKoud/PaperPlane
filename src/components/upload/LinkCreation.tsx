import type { AxiosError } from "axios";
import React from "react";
import { Field, Form, Formik } from "formik";
import { object, string } from "yup";
import copy from "copy-to-clipboard";
import { useAuth } from "../../lib/hooks/useAuth";
import { ApiError, fetch } from "../../lib";
import { alert, success } from "../../lib/notifications";
import PulseLoader from "../general/PulseLoader";

interface Link {
	path: string;
	url: string;
}

const LinkCreation: React.FC = () => {
	const { user } = useAuth();

	const saveLink = async (data: Link) => {
		try {
			const { data: resData } = await fetch<{ url: string }>("/api/upload", undefined, {
				method: "POST",
				headers: {
					Authorization: user?.token ?? ""
				},
				data: {
					short: data.url,
					path: data.path
				}
			});

			copy(resData.url);
			success("Link created", "Link created and copied to clipboard");
		} catch (error) {
			if (!error || typeof error !== "object" || !("isAxiosError" in error)) return;

			const err = error as AxiosError<ApiError>;
			alert("Upload failed", `${err.response?.data.message ?? "Unknown error, please try again later!"}`);
		}
	};

	const validationSchema = object({
		url: string().url("Item must be a URL").required("Item is required"),
		path: string().min(3, "Must be 3 characters or longer").max(20, "Shortlink code is too long").required("Item is required")
	});

	return (
		<div className="link-upload">
			<Formik onSubmit={saveLink} initialValues={{ url: "", path: "" }} validationSchema={validationSchema} validateOnMount validateOnChange>
				{({ isValid, isSubmitting, errors }) => (
					<Form className="edit-container">
						{isSubmitting ? (
							<PulseLoader />
						) : (
							<>
								<p>Create Link</p>
								<Field as="input" id="path" name="path" placeholder="code..." style={{ width: "90%" }} />
								<span style={{ color: "var(--red)" }}>{errors.path}</span>
								<p>URL</p>
								<Field as="input" id="url" type="url" name="url" placeholder="url..." style={{ width: "90%" }} />
								<span style={{ color: "var(--red)" }}>{errors.url}</span>
								<button disabled={!isValid} style={{ marginBottom: "1rem" }} type="submit">
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

export default LinkCreation;

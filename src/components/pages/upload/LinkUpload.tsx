import { ThreeDots } from "@agney/react-loading";
import { AxiosError } from "axios";
import React from "react";
import { fetch } from "../../../lib/fetch";
import { useAuth } from "../../../lib/hooks/useAuth";
import { alert, success } from "../../../lib/notifications";
import { ApiError } from "../../../lib/types";
import { Field, Form, Formik } from "formik";
import { object, string } from "yup";
import copy from "copy-to-clipboard";

interface Link {
	path: string;
	url: string;
}

export const LinkUpload: React.FC = () => {
	const { user } = useAuth();
	const saveLink = async (data: Link) => {
		try {
			const { data: resData } = await fetch<{ url: string }>("/upload", {
				method: "POST",
				headers: {
					Authorization: user.token,
				},
				data: JSON.stringify({
					short: data.url,
					path: data.path,
				}),
			});

			copy(resData.url);
			success("Link created", "Link created and copied to clipboard");
		} catch (err) {
			if (!("isAxiosError" in err)) return;

			const error = err as AxiosError<ApiError>;
			alert("Upload failed", `${error.response.data.message ?? "Unknown error"}`);
			console.error(error.response.data.error ?? "Unknown error");
		}
	};

	const validationSchema = object({
		url: string().url("Item must be a URL").required("Item is required"),
		path: string()
			.min(3, "Must be 3 characters or longer")
			.max(20, "Shortlink code is too long")
			.required("Item is required"),
	});

	return (
		<div className="link-upload">
			<Formik
				onSubmit={saveLink}
				initialValues={{ url: "", path: "" }}
				validationSchema={validationSchema}
				validateOnMount
				validateOnChange>
				{({ isValid, isSubmitting, errors }) => (
					<Form className="edit-container">
						{isSubmitting ? (
							<ThreeDots style={{ width: "100px" }} />
						) : (
							<>
								<p>Create Link</p>
								<Field
									as="input"
									id="path"
									name="path"
									placeholder="code..."
									style={{ width: "90%" }}
								/>
								<span>{errors.path}</span>
								<p>URL</p>
								<Field
									as="input"
									id="url"
									type="url"
									name="url"
									placeholder="url..."
									style={{ width: "90%" }}
								/>
								<span>{errors.url}</span>
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

import { Formik, Form } from "formik";
import React from "react";
import { fetch } from "../../../lib/fetch";
import { useAuth } from "../../../lib/hooks/useAuth";
import { object, string } from "yup";
import PulseLoader from "../../general/PulseLoader";
import type { AxiosError } from "axios";
import type { ApiError } from "../../../lib";
import { alert } from "../../../lib/notifications";
import ReactSelectDropdown from "../../general/ReactDropdown";

interface Props {
	handleClose: () => void;
}

const options = [
	{
		label: "Dark Theme",
		value: "dark"
	},
	{
		label: "Light Theme",
		value: "light"
	}
];

const EditThemeModal: React.FC<Props> = ({ handleClose }) => {
	const { user, fetch: FetchUser } = useAuth();

	const validationSchema = object({
		theme: string()
			.required("Theme is required")
			.oneOf(options.map((opt) => opt.value))
	});

	const submit = async (data: { theme: string }) => {
		try {
			await fetch("/api/user", undefined, { method: "PATCH", data: { theme: data.theme } });
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
				initialValues={{ theme: user?.theme ?? "dark" }}
				validationSchema={validationSchema}
				validateOnMount
				validateOnChange
			>
				{({ isValid, isSubmitting, errors, values, setFieldValue }) => (
					<Form className="edit-container">
						{isSubmitting ? (
							<PulseLoader />
						) : (
							<>
								<p>Theme</p>
								<ReactSelectDropdown
									className="edit-container-dropdown"
									options={options}
									value={options.find((opt) => opt.value === values.theme)}
									onChange={(selected) => setFieldValue("theme", selected?.value ?? "dark")}
								/>
								<span>{errors.theme}</span>
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

export default EditThemeModal;

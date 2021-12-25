import type { AxiosError } from "axios";
import { Field, Form, Formik } from "formik";
import React from "react";
import { object, string } from "yup";
import { ApiError, fetch } from "../../lib";
import { useAuth } from "../../lib/hooks/useAuth";
import { alert, success } from "../../lib/notifications";
import DiscordEmbed from "../general/DiscordEmbed";
import ToggleSwitch from "../general/ToggleSwitch";
import ColourPicker from "./ColourPicker";

interface OnSubmitTypes {
	embedDescription: string;
	embedTitle: string;
	embedColour: string;
	embedEnabled: boolean;
}

const EmbedSettings: React.FC = () => {
	const { user } = useAuth();

	const schema = object({
		embedColour: string(),
		embedTitle: string().max(256, "Embed title cannot be longer than 256 characters"),
		embedDescription: string().max(4096, "Embed description cannot be longer than 4096 characters")
	});

	const onSubmit = async (data: OnSubmitTypes) => {
		try {
			await fetch("/api/user/embed", undefined, { method: "PATCH", data });
			success("Embed settings updated", "Successfully updated the embed settings");
		} catch (error) {
			if (!error || typeof error !== "object" || !("isAxiosError" in error)) return;

			const err = error as AxiosError<ApiError>;
			alert("Unable to update the embed settings", `${err.response?.data.message ?? "Unknown error, please try again later!"}`);
		}
	};

	return user ? (
		<>
			<h1>
				<i className="fab fa-discord" /> Embed Settings
			</h1>
			<div className="settings-container">
				<Formik
					validateOnChange
					validateOnMount
					validationSchema={schema}
					onSubmit={onSubmit}
					initialValues={{
						embedDescription: user.embedDescription ?? "",
						embedTitle: user.embedTitle ?? "",
						embedColour: user.embedColour ?? "#000000",
						embedEnabled: user.embedEnabled
					}}
				>
					{({ values, errors, isValid }) => (
						<Form className="embed-settings-wrapper">
							<div className="embed-settings-container">
								<DiscordEmbed
									enabled={values.embedEnabled}
									colour={values.embedColour}
									title={values.embedTitle}
									description={values.embedDescription}
								/>
								<ul className="embed-settings">
									<li className="embed-settings-item flex-row">
										<h3>Embed enabled</h3>
										<ToggleSwitch id="embedEnabled" />
									</li>
									<li className="embed-settings-item">
										<h3>Embed colour</h3>
										<ColourPicker id="embedColour" />
										<p>{errors.embedColour}</p>
									</li>
									<li className="embed-settings-item">
										<h3>Embed title</h3>
										<Field className="embed-settings-text" id="embedTitle" name="embedTitle" />
										<p>{errors.embedTitle}</p>
									</li>
									<li className="embed-settings-item">
										<h3>Embed description</h3>
										<Field className="embed-settings-text" as="textarea" id="embedDescription" name="embedDescription" />
										<p>{errors.embedDescription}</p>
									</li>
								</ul>
							</div>
							<button type="submit" disabled={!isValid}>
								<i className="fas fa-save" /> Save
							</button>
						</Form>
					)}
				</Formik>
			</div>
		</>
	) : (
		<div></div>
	);
};

export default EmbedSettings;

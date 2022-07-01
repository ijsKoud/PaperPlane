import { FastFieldProps, Field, Form, Formik } from "formik";
import React from "react";
import ReactSwitch from "react-switch";
import { toast } from "react-toastify";
import { object, string } from "yup";
import { fetch } from "../../../lib/fetch";
import { useAuth } from "../../../lib/hooks/useAuth";
import type { FC } from "../../../lib/types";
import ColourPicker from "./ColourPicker";
import DiscordEmbed from "./EmbedVisualiser";

interface OnSubmitTypes {
	embedDescription: string;
	embedTitle: string;
	embedColour: string;
	embedEnabled: boolean;
}

const EmbedSettings: FC = () => {
	const { user } = useAuth();

	const schema = object({
		embedColour: string(),
		embedTitle: string().max(256, "Embed title cannot be longer than 256 characters"),
		embedDescription: string().max(4096, "Embed description cannot be longer than 4096 characters")
	});

	const onSubmit = async (data: OnSubmitTypes) => {
		try {
			const embedPromise = fetch("/api/user/embed", undefined, { method: "PATCH", data });
			await toast.promise(embedPromise, {
				error: "Unable to update the embed settings, please try again later.",
				success: "Successfully the embed settings.",
				pending: "Attempting to update the embed settings"
			});
		} catch (err) {}
	};

	return user ? (
		<>
			<h1>Embed Settings</h1>
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
										<Field id="embedEnabled" name="embedEnabled">
											{({ form, field }: FastFieldProps<boolean>) => (
												<ReactSwitch
													checkedIcon={false}
													uncheckedIcon={false}
													onChange={(checked) => form.setFieldValue("embedEnabled", checked)}
													checked={field.value}
												/>
											)}
										</Field>
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
							<button className="button button-blurple" type="submit" disabled={!isValid}>
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

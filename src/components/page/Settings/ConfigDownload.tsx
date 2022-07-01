import { saveAs } from "file-saver";
import React from "react";
import { useAuth } from "../../../lib/hooks/useAuth";
import Button from "../../general/Button";

const ConfigDownload: React.FC = () => {
	const { user } = useAuth();

	const downloadShareX = () => {
		const getProtocol = () => {
			const env = process.env.SECURE;
			if (env && env === "false") return "http://";

			return "https://";
		};

		const config = {
			Name: "PaperPlane",
			DestinationType: "ImageUploader, TextUploader, FileUploader, URLShortener",
			RequestMethod: "POST",
			RequestURL: `${getProtocol()}${location?.host}/api/upload`,
			Headers: {
				Authorization: user?.token
			},
			URL: "$json:url$",
			Body: "MultipartFormData",
			FileFormName: "upload",
			Arguments: {
				name: "$filename$",
				short: "$input$"
			}
		};

		const blob = new Blob([JSON.stringify(config)], {
			type: "data:application/json;charset=utf-8"
		});
		saveAs(blob, "PaperPlane-config.sxcu");
	};

	return user ? (
		<div className="settings-container">
			<div className="embed-settings-wrapper">
				<h2>ShareX Config</h2>
				<Button type="button" style="blurple" onClick={downloadShareX}>
					<i className="fas fa-download" /> Download
				</Button>
			</div>
		</div>
	) : (
		<div></div>
	);
};

export default ConfigDownload;

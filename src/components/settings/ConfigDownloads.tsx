import { saveAs } from "file-saver";
import React from "react";
import { useAuth } from "../../lib/hooks/useAuth";

const ConfigDownloads: React.FC = () => {
	const { user } = useAuth();

	const downloadShareX = () => {
		const config = {
			Name: "PaperPlane",
			DestinationType: "ImageUploader, TextUploader, FileUploader, URLShortener",
			RequestMethod: "POST",
			RequestURL: `${process.env.NEXT_PUBLIC_DOMAIN}/api/upload`,
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
			type: "'data:application/json;charset=utf-8"
		});
		saveAs(blob, "PaperPlane-config.sxcu");
	};

	return user ? (
		<>
			<h1>
				<i className="fas fa-clipboard-check" /> Config Files
			</h1>
			<div className="settings-container">
				<div className="settings-component">
					<h3>ShareX Config</h3>
					<button onClick={downloadShareX}>
						<i className="fas fa-download" /> Download
					</button>
				</div>
			</div>
		</>
	) : (
		<div></div>
	);
};

export default ConfigDownloads;

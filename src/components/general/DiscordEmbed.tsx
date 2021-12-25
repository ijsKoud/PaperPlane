import React from "react";

interface Props {
	colour: string;
	title: string;
	description: string;
	enabled: boolean;
}

const DiscordEmbed: React.FC<Props> = ({ enabled, colour, title, description }) => {
	return (
		<div className={`embed-settings-discord ${enabled ? "" : "disabled"} discord`}>
			<div className="discord-embed">
				<div className="discord-embed-border" style={{ backgroundColor: colour }}>
					<wbr />
				</div>
				<div className="discord-embed-content">
					<h1 className="discord-embed-title">{title}</h1>
					<p className="discord-embed-description">{description}</p>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img src="/assets/images/paperplane.png" alt="paperplane-logo" className="discord-embed-image" />
				</div>
			</div>
		</div>
	);
};

export default DiscordEmbed;

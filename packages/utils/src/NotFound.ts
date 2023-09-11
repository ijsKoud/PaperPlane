import type React from "react";

export class NotFoundError {
	public readonly subtitle = "An open-source customisable solution to storing files in the cloud. ✈️";
	public readonly subtitleAlt = "4n 0p3n-s0Urc3 cUSt0m1S4b\\3 s0lUt10n t0 St0r1n9 f1l3S 1n Th3 c\\0ud. 💥";

	public readonly titleFront = "APER";
	public readonly titleFrontAlt = "4P3R";

	public readonly titleBack = "PLANE";
	public readonly titleBackAlt = "P\\4N3";

	private interval: NodeJS.Timer | null = null;

	/**
	 * Starts the interval which updates the error messages ever 2 seconds
	 * @param setters The message useState setters
	 */
	public start(...setters: React.Dispatch<React.SetStateAction<string>>[]) {
		const [subtitle, titleOne, titleTwo] = setters;
		const updateMessages = () => {
			subtitle((res) => (res === this.subtitle ? this.subtitleAlt : this.subtitle));
			titleOne((res) => (res === this.titleFront ? this.titleFrontAlt : this.titleFront));
			titleTwo((res) => (res === this.titleBack ? this.titleBackAlt : this.titleBack));
		};

		updateMessages();
		const interval = setInterval(updateMessages, 2e3);
		this.interval = interval;
	}

	/**
	 * Stops the interval from running
	 */
	public stop() {
		if (!this.interval) return;

		clearInterval(this.interval);
		this.interval = null;
	}
}

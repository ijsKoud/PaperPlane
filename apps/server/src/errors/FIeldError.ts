import PaperPlaneError, { PaperPlaneErrorCodes } from "./PaperPlaneError.js";

export default class FieldError extends PaperPlaneError {
	public constructor(field: string, message: string) {
		super(PaperPlaneErrorCodes.fieldError, message, field);
	}

	public getJSONStringified() {
		return JSON.stringify(this.toJSON());
	}
}

import PaperPlaneError, { PaperPlaneErrorCodes } from "./PaperPlaneError.js";

export default class DisabledDomainError extends PaperPlaneError {
	public constructor() {
		super(PaperPlaneErrorCodes.disabledDomain, "This domain has been disabled by the administrator");
	}
}

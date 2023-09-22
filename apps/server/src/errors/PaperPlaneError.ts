export default class PaperPlaneError extends Error {
	/** The reason why this error was thrown */
	public override message: string;

	/** The error code associated with this error */
	public code: string;

	/** The path to the object field that caused this error */
	public field: string | undefined;

	/**
	 * @param code The error code associated with this error
	 * @param message The reason why this error was thrown
	 * @param field  The path to the object field that caused this error
	 */
	public constructor(code: string, message: string, field?: string | undefined) {
		super(message);

		this.code = code;
		this.message = message;
		this.field = field;
	}

	public override toString() {
		return `[ERROR ${this.code}]: ${this.message} (caused by ${this.field ?? "unknown"})`;
	}

	public toJSON() {
		return {
			code: this.code,
			message: this.message,
			field: this.field
		};
	}
}

export const PaperPlaneErrorCodes = {
	disabledDomain: "EDISABLEDDOMAIN",
	fieldError: "EINVALIDFIELD"
} as const;

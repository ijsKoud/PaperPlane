// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class BackupUtils {
	public static typeofString(value: any): value is string {
		return typeof value === "string";
	}

	public static typeofBoolean(value: any): value is boolean {
		return typeof value === "boolean";
	}

	public static typeofNumber(value: any): value is number {
		return typeof value === "number";
	}
}

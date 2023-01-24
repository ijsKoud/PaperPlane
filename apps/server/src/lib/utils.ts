// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Utils {
	public static chunk<T>(arr: T[], size: number): T[][] {
		const result = [];
		const L = arr.length;
		let i = 0;

		while (i < L) result.push(arr.slice(i, (i += size)));

		return result;
	}
}

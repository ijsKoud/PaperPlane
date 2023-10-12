import type Server from "#server.js";

export default abstract class Backup {
	/** The paperplane server instance */
	public readonly server: Server;

	/** The location of the data directory */
	public readonly dir: string;

	public constructor(server: Server, dir: string) {
		this.server = server;
		this.dir = dir;
	}

	/** typeguard for strings */
	protected typeofString(value: any): value is string {
		return typeof value === "string";
	}

	/** typeguard for booleans */
	protected typeofBoolean(value: any): value is boolean {
		return typeof value === "boolean";
	}

	/** typeguard for numbers */
	protected typeofNumber(value: any): value is number {
		return typeof value === "number";
	}

	/**
	 * Maps the errors into a kv object
	 * @param errors The errors the map
	 * @returns
	 */
	protected mapErrors<E extends any[]>(errors: E) {
		return errors
			.map((res, key) => ({ res, key }))
			.filter((res) => typeof res.res === "string")
			.map((res) => ({ [res.key]: res.res as string }));
	}
}

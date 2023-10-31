import Fuse, { type IFuseOptions } from "fuse.js";

export default class FuzzySearch<V> {
	public readonly values: V[];
	public readonly fuse: Fuse<V>;

	public constructor(values: V[], opts: IFuseOptions<V> & { keys: (keyof V)[] }) {
		const fuse = new Fuse<V>(values, { threshold: 0.2, isCaseSensitive: false, ...opts });
		this.fuse = fuse;
		this.values = values;
	}

	public search(query: string): V[] {
		if (!query.length) return this.values;

		const results = this.fuse.search(query);
		return results.map((result) => result.item);
	}
}

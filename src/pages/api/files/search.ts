import { readdir, stat } from "fs/promises";
import type { NextApiRequest, NextApiResponse } from "next";
import { join } from "path";
import { File, FILE_DATA_DIR } from "../../../lib";
import { chunk, formatBytes, getUser, parseQuery, sortFilesArray } from "../../../lib/utils";
import { lookup } from "mime-types";
import MiniSearch from "minisearch";

interface Data {
	pages: File[];
	length: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data | null>) {
	const user = await getUser(req);
	if (!user) return res.status(401).send(null);

	const page = Number(parseQuery(req.query.page ?? "1"));
	const sortType = parseQuery(req.query.sortType ?? "default");
	const search = decodeURIComponent(parseQuery(req.query.search ?? ""));

	const files = await readdir(FILE_DATA_DIR);

	let mapped = await Promise.all(
		files.map(async (file) => {
			const info = await stat(join(FILE_DATA_DIR, file));
			return {
				name: file,
				size: formatBytes(info.size),
				_size: info.size,
				date: info.birthtimeMs,
				type: lookup(file) || "unknown"
			};
		})
	);

	if (search.length > 0) {
		const _mapped = mapped.map((v, i) => ({ ...v, id: i }));
		const searcher = new MiniSearch({
			fields: ["name"],
			storeFields: ["name", "size", "_size", "date", "type"]
		});

		searcher.addAll(_mapped);
		const results = searcher.search(search);
		mapped = results.map((result) => _mapped[result.id]);
	}

	const sorted = sortFilesArray(mapped, sortType);
	const chunks = chunk(sorted, 25);
	res.send({ pages: chunks[page - 1] ?? [], length: chunks.length });
}

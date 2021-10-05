import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { lstat, readdir, readFile, stat } from "fs/promises";
import { join } from "path/posix";
import { Link } from "../types";
import {
	chunk,
	formatBytes,
	parseQuery,
	sizeOfDir,
	sortFilesArray,
	sortLinksArray,
} from "../utils";
import { lookup } from "mime-types";
import MiniSearch from "minisearch";
import rateLimit from "express-rate-limit";
import getSettings from "../../settings";

const settings = getSettings();
const ratelimit = rateLimit({
	windowMs: settings.ratelimit.time,
	max: settings.ratelimit.amount,
});

const router = Router();
const client = new PrismaClient();

router.get("/", ratelimit, async (req, res) => {
	const { session } = req.cookies;
	if (!session)
		return res.status(401).send({
			message: "You must be logged in to perform this action",
			error: "User unauthorized",
		});

	const user = await client.session.findFirst({
		where: { token: session },
		include: { user: true },
	});
	if (!user)
		return res.status(401).send({
			message: "You must be logged in to perform this action",
			error: "User unauthorized",
		});

	const base = join(process.cwd(), "data", user.userId);

	let rawBytes = await sizeOfDir(join(base, "files"));
	rawBytes += (await lstat(join(base, "links.json"))).size;
	const bytes = formatBytes(rawBytes);

	const files = await readdir(join(base, "files"));

	const linksRaw = await readFile(join(base, "links.json"), { encoding: "utf-8" });
	const links: Link[] = JSON.parse(linksRaw);

	const users = await client.user.findMany();

	res.send({
		files: {
			bytes,
			size: files.length,
		},
		links: links.length,
		users: users.length,
	});
});

router.get("/links", ratelimit, async (req, res) => {
	const page = Number(parseQuery(req.query.page ?? "1"));
	const sortType = parseQuery(req.query.sortType ?? "default");
	const search = decodeURIComponent(parseQuery(req.query.search ?? ""));

	const { session } = req.cookies;
	if (!session)
		return res.status(401).send({
			message: "You must be logged in to perform this action",
			error: "User unauthorized",
		});

	const user = await client.session.findFirst({
		where: { token: session },
		include: { user: true },
	});
	if (!user)
		return res.status(401).send({
			message: "You must be logged in to perform this action",
			error: "User unauthorized",
		});

	const file = join(process.cwd(), "data", user.userId, "links.json");
	const linksRaw = await readFile(file, "utf-8");
	let links: Link[] = JSON.parse(linksRaw);

	if (search.length > 0) {
		const _links = links.map((v, i) => ({ ...v, id: i }));
		const searcher = new MiniSearch({
			fields: ["name"],
			storeFields: ["name", "size", "_size", "date", "type"],
		});

		searcher.addAll(_links);
		const results = searcher.search(search);
		links = results.map((result) => _links[result.id]);
	}

	const sorted = sortLinksArray(links, sortType);
	const chunks = chunk(sorted, 25);
	res.send({ pages: chunks[page - 1] ?? [], length: chunks.length });
});

router.get("/files", ratelimit, async (req, res) => {
	const page = Number(parseQuery(req.query.page ?? "1"));
	const sortType = parseQuery(req.query.sortType ?? "default");
	const search = decodeURIComponent(parseQuery(req.query.search ?? ""));

	const { session } = req.cookies;
	if (!session)
		return res.status(401).send({
			message: "You must be logged in to perform this action",
			error: "User unauthorized",
		});

	const user = await client.session.findFirst({
		where: { token: session },
		include: { user: true },
	});
	if (!user)
		return res.status(401).send({
			message: "You must be logged in to perform this action",
			error: "User unauthorized",
		});

	const dir = join(process.cwd(), "data", user.userId, "files");
	const files = await readdir(dir);

	let mapped = await Promise.all(
		files.map(async (file) => {
			const info = await stat(join(dir, file));
			return {
				name: file,
				size: formatBytes(info.size),
				_size: info.size,
				date: info.birthtimeMs,
				type: lookup(file) || "unknown",
			};
		})
	);

	if (search.length > 0) {
		const _mapped = mapped.map((v, i) => ({ ...v, id: i }));
		const searcher = new MiniSearch({
			fields: ["name"],
			storeFields: ["name", "size", "_size", "date", "type"],
		});

		searcher.addAll(_mapped);
		const results = searcher.search(search);
		mapped = results.map((result) => _mapped[result.id]);
	}

	const sorted = sortFilesArray(mapped, sortType);
	const chunks = chunk(sorted, 25);
	res.send({ pages: chunks[page - 1] ?? [], length: chunks.length });
});

export default router;

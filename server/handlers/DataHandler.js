/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient } = require("@prisma/client");
const { FILE_DATA_DIR } = require("../constants");
const { readdir } = require("fs/promises");
const limiter = require("express-rate-limit").default;
const { Router } = require("express");
const { join } = require("path");

const client = new PrismaClient();
const ratelimit = limiter({
	windowMs: 2e3,
	max: 25
});

module.exports = function DataHandler(nextApp) {
	const router = Router();
	router.post("/api/upload", ratelimit, async (req, res, next) => {
		const { short, path: linkPath } = req.body ?? {};
		if ((!linkPath || typeof linkPath !== "string") && (!short || typeof short !== "string")) return next();

		const links = await prisma.url.findMany();
		let path = linkPath;

		if (!path || links.find((link) => link.id === linkPath)) {
			path = nanoid(settings.fileNameLength);
			while (links.find((link) => link.id === path)) path = nanoid(settings.fileNameLength);
		}

		await prisma.url.create({ data: { date: new Date(), url: short, id: path } });
		res.send({ url: `${process.env.NEXT_PUBLIC_DOMAIN}/r/${path}` });
	});

	router.get("/files/:id", ratelimit, async (req, res) => {
		const { id } = req.params;
		const { raw: rawQuery } = req.query;

		const raw = typeof rawQuery === "string" ? (rawQuery === "true" ? true : false) : false;
		const user = await client.user.findFirst();

		if (user?.embedEnabled && !raw) return nextApp.render(req, res, `/files/${id}`);

		const path = join(FILE_DATA_DIR, id);
		if (!path.startsWith(FILE_DATA_DIR)) return nextApp.render404(req, res);

		const files = await readdir(FILE_DATA_DIR);
		if (!files.includes(id)) return nextApp.render404(req, res);

		res.sendFile(path, (err) => {
			if (err) {
				res.end();
			}
		});
	});
	router.get("/r/:id", ratelimit, async (req, res) => {
		const { id } = req.params;

		try {
			const url = await client.url.findFirst({ where: { id } });
			if (!url) return nextApp.render404(req, res);

			res.redirect(url.url);
		} catch (err) {
			console.error(err);
		}

		nextApp.render404(req, res);
	});

	return router;
};

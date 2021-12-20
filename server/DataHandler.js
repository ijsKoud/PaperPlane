/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-var-requires */
const { FILE_DATA_DIR, URL_DATA_FILE } = require("./constants");
const { readdir, readFile } = require("fs/promises");
const { Router } = require("express");
const { join } = require("path");

module.exports = function DataHandler(nextApp) {
	const router = Router();
	router.get("/files/:id", async (req, res) => {
		const { id } = req.params;

		const path = join(FILE_DATA_DIR, id);
		if (!path.startsWith(FILE_DATA_DIR)) return nextApp.render404(req, res);

		const files = await readdir(FILE_DATA_DIR);
		if (!files.includes(id)) return nextApp.render404(req, res);

		res.sendFile(path, (err) => {
			console.error(err);
			res.end();
		});
	});

	router.get("/r/:id", async (req, res) => {
		const { id } = req.params;

		try {
			const file = await readFile(URL_DATA_FILE, "utf-8");
			const urls = JSON.parse(file);
			if (!Array.isArray(urls)) return nextApp.render404(req, res);

			const url = urls.find((url) => url.id === id);
			if (url && url.url) return res.redirect(url.url);
		} catch (err) {
			console.error(err);
		}

		nextApp.render404(req, res);
	});

	return router;
};

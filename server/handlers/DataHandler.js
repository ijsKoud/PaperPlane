/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient } = require("@prisma/client");
const { FILE_DATA_DIR } = require("../constants");
const { readdir } = require("fs/promises");
const { Router } = require("express");
const { join } = require("path");

const client = new PrismaClient();

/*
<!-- Primary Meta Tags -->
<meta name="title" content="Meta Tags — Preview, Edit and Generate">
<meta name="description" content="With Meta Tags you can edit and experiment with your content then preview how your webpage will look on Google, Facebook, Twitter and more!">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://metatags.io/">
<meta property="og:title" content="Meta Tags — Preview, Edit and Generate">
<meta property="og:description" content="With Meta Tags you can edit and experiment with your content then preview how your webpage will look on Google, Facebook, Twitter and more!">
<meta property="og:image" content="https://metatags.io/assets/meta-tags-16a33a6a8531e519cc0936fbba0ad904e52d35f34a46c97a2c9f6f7dd7d336f2.png">

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="https://metatags.io/">
<meta property="twitter:title" content="Meta Tags — Preview, Edit and Generate">
<meta property="twitter:description" content="With Meta Tags you can edit and experiment with your content then preview how your webpage will look on Google, Facebook, Twitter and more!">
<meta property="twitter:image" content="https://metatags.io/assets/meta-tags-16a33a6a8531e519cc0936fbba0ad904e52d35f34a46c97a2c9f6f7dd7d336f2.png">
*/

module.exports = function DataHandler(nextApp) {
	const router = Router();
	router.get("/files/:id", async (req, res) => {
		const { id } = req.params;

		const path = join(FILE_DATA_DIR, id);
		if (!path.startsWith(FILE_DATA_DIR)) return nextApp.render404(req, res);

		const files = await readdir(FILE_DATA_DIR);
		if (!files.includes(id)) return nextApp.render404(req, res);

		res.sendFile(path, (err) => {
			if (err) {
				console.error(err);
				res.end();
			}
		});
	});
	router.get("/r/:id", async (req, res) => {
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

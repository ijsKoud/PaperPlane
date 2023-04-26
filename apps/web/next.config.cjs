/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-var-requires */
// const { readdirSync } = require("node:fs");
// const { join } = require("node:path");
// const packages = readdirSync(join(process.cwd(), "..", "..", "packages"));

/** @type {import('next').NextConfig} */
module.exports = {
	reactStrictMode: true,
	transpilePackages: [
		"@paperplane/buttons",
		"@paperplane/forms",
		"@paperplane/logo",
		"@paperplane/markdown",
		"@paperplane/modal",
		"@paperplane/navbar",
		"@paperplane/swr",
		"@paperplane/ui",
		"@paperplane/utils"
	]
};

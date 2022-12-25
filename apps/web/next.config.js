/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-var-requires */
const { readdirSync } = require("node:fs");
const { join } = require("node:path");
const packages = readdirSync(join("..", "..", "packages"));

/** @type {import('next').NextConfig} */
module.exports = {
	reactStrictMode: true,
	transpilePackages: packages
};

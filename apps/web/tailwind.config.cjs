const config = require("../../tailwind.config.cjs");
const { readdirSync } = require("node:fs");
const { join } = require("node:path");

const packages = readdirSync(join("..", "..", "packages"));
const packagesPaths = packages.map((pkg) => `../../packages/${pkg}/**/*.{js,ts,jsx,tsx}`);

/** @type {import('tailwindcss').Config} */
module.exports = { ...config, content: ["./src/pages/**/*.{js,ts,jsx,tsx}", ...packagesPaths] };

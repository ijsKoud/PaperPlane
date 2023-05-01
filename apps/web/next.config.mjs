import { readdirSync } from "node:fs";
import { join } from "node:path";

const transpilePackages = readdirSync(join(process.cwd(), "..", "..", "packages")).map((pkg) => `@paperplane/${pkg}`);

/** @type {import('next').NextConfig} */
const config = {
	reactStrictMode: false,
	transpilePackages
};

export default config;

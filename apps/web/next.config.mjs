// import { readdirSync } from "node:fs";
// import { join } from "node:path";

// const transpilePackages = readdirSync(join(process.cwd(), "..", "..", "packages")).map((pkg) => `@paperplane/${pkg}`);

/** @type {import('next').NextConfig} */
const config = {
	reactStrictMode: false,
	transpilePackages: [
		"@paperplane/buttons",
		"@paperplane/forms",
		"@paperplane/logo",
		"@paperplane/markdown",
		"@paperplane/modal",
		"@paperplane/navbar",
		"@paperplane/swr",
		"@paperplane/components",
		"@paperplane/ui",
		"@paperplane/utils"
	]
};

export default config;

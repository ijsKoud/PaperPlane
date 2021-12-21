/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-var-requires */
const { exec } = require("child_process");
const { mkdir } = require("fs/promises");
const { join } = require("path");

// Utils
const execute = (cmd) => new Promise((res) => exec(cmd, (err) => res(err ? err : null)));

void (async () => {
	console.info("[INFO] - Creating data folders...");
	await mkdir(join(process.cwd(), "data", "files"), { recursive: true });

	// check if yarn is installed
	const yarnInstalled = await execute("yarn --version");
	if (yarnInstalled) {
		console.info("[INFO] - Downloading and installing yarn...");
		const installYarn = await execute("npm i -g yarn");
		if (!installYarn) {
			console.error(
				"[ERROR] - Unable to install yarn, please run 'npm i -g yarn' in the console to install Yarn. After that, run this script again!",
				installYarn
			);
			return;
		}
	}

	console.info("[INFO] - Installing the required dependencies...");
	const installDeps = await execute("yarn install");
	if (installDeps) {
		console.error("[ERROR] - Unable to install the required dependencies, please try again later.", installDeps);
		return;
	}

	console.info("[INFO] - Building web application...");
	const buildWeb = await execute("yarn build");
	if (buildWeb) {
		console.error("[ERROR] - An error occured while building the web application, please try again later", buildWeb);
		return;
	}

	console.info("[INFO] - Installation completed!");
})();

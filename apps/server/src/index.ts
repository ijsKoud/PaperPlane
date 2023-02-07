import { config } from "dotenv";
import { exec } from "node:child_process";
import { join } from "node:path";
config({ path: join(process.cwd(), "..", "..", "data", ".env") });

import Server from "./Server.js";
void (async () => {
	await new Promise((res, rej) => exec("prisma db push", (err) => (err ? rej(err) : res(null))));
	const server = new Server();
	await server.run();
})();

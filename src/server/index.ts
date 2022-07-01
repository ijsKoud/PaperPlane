import { config } from "dotenv";
import { exec } from "node:child_process";
import { join } from "node:path";
config({ path: join(process.cwd(), "data", ".env") });

import { Server } from "./Server";

void (async () => {
	await new Promise((res) => exec("yarn prisma db push", res));

	const server = new Server();
	await server.run();
})();
